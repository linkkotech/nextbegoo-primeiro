import { getServerSession } from 'next-auth';
import { authOptions } from './options';

export type MerchantSession = {
  userId: string;
  email: string;
  merchantId?: string;
  merchantIds?: string[];
  userType: 'CONSUMER' | 'MERCHANT' | 'STAFF';
};

export async function getMerchantSession(): Promise<MerchantSession | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // TODO: Implementar lógica para buscar merchantIds do usuário
  // Por enquanto, retornando estrutura básica
  return {
    userId: session.user.id || '',
    email: session.user.email || '',
    userType: (session.user.userType as 'CONSUMER' | 'MERCHANT' | 'STAFF') || 'CONSUMER',
    merchantId: session.user.merchantId,
    merchantIds: session.user.merchantIds,
  };
}
