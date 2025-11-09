'use server';

import { prisma } from '@/lib/db/prisma';
import { getMerchantSession } from '@/lib/auth/session';
import { z } from 'zod';

const payloadSchema = z.object({
  merchantId: z.string().uuid(),
});

export type EligibilityResult = {
  isEligible: boolean;
  reasons: string[];
  context: {
    subscriptionStatus?: string;
    complianceStatus?: string;
    aiAssistantStatus?: string;
    isOpenNow?: boolean;
  };
};

export async function checkEligibility(input: unknown): Promise<EligibilityResult> {
  const { merchantId } = payloadSchema.parse(input);
  const session = await getMerchantSession();

  if (!session?.merchantIds?.includes(merchantId) && session?.merchantId !== merchantId) {
    throw new Error('Acesso não autorizado para este workspace.');
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      profiles: {
        where: { isPrimary: true },
        take: 1,
      },
      aiAssistants: {
        where: { status: 'ACTIVE' },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!merchant) {
    return {
      isEligible: false,
      reasons: ['merchant_not_found'],
      context: {},
    };
  }

  const failures: string[] = [];

  const subscription = merchant.subscriptions.at(0);
  const now = new Date();

  const hasActiveSubscription =
    subscription?.status === 'ACTIVE' &&
    (!subscription.currentPeriodEnd || subscription.currentPeriodEnd >= now);

  if (!hasActiveSubscription) {
    failures.push('subscription_inactive');
  }

  if (merchant.complianceStatus !== 'APPROVED') {
    failures.push('compliance_not_approved');
  }

  const aiAssistant = merchant.aiAssistants.at(0);
  if (!aiAssistant) {
    failures.push('ai_assistant_offline');
  }

  const profile = merchant.profiles.at(0);
  const isOpenNow = evaluateWorkingHours(profile?.workingHoursJson, merchant.timezone, now);

  if (!isOpenNow && (!aiAssistant || aiAssistant.status !== 'ACTIVE')) {
    failures.push('business_closed_and_ai_offline');
  }

  if (!isOpenNow && failures.length === 0) {
    failures.push('business_closed_outside_hours');
  }

  return {
    isEligible: failures.length === 0,
    reasons: failures,
    context: {
      subscriptionStatus: subscription?.status,
      complianceStatus: merchant.complianceStatus,
      aiAssistantStatus: aiAssistant?.status,
      isOpenNow,
    },
  };
}

type WorkingHoursSchema = {
  [weekday in
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday']?: Array<{
    open: string; // HH:mm
    close: string; // HH:mm
    closed?: boolean;
  }>;
};

function evaluateWorkingHours(
  workingHours: unknown,
  timezone: string,
  referenceDate: Date,
): boolean {
  if (!workingHours) return true;

  const parsed = safeParseWorkingHours(workingHours);
  if (!parsed) return true;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts = formatter.formatToParts(referenceDate);
  const weekday = parts.find((p) => p.type === 'weekday')?.value?.toLowerCase();
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');

  if (!weekday) return true;

  const segments = parsed[weekday as keyof WorkingHoursSchema];
  if (!segments || segments.length === 0) return true;

  const currentMinutes = hour * 60 + minute;

  return segments.some((segment) => {
    if (segment.closed) return false;
    const [openHour, openMinute] = segment.open.split(':').map(Number);
    const [closeHour, closeMinute] = segment.close.split(':').map(Number);
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  });
}

function safeParseWorkingHours(payload: unknown): WorkingHoursSchema | null {
  try {
    if (typeof payload === 'string') {
      return JSON.parse(payload) as WorkingHoursSchema;
    }
    return payload as WorkingHoursSchema;
  } catch {
    return null;
  }
}
