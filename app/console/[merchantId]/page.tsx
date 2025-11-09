import { getMerchantSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { checkEligibility } from '@/app/actions/eligibility';

export default async function ConsolePage({
  params,
}: {
  params: { merchantId: string };
}) {
  const session = await getMerchantSession();
  const merchant = await prisma.merchant.findUnique({
    where: { id: params.merchantId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { plan: true },
      },
      profiles: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  const eligibility = await checkEligibility({ merchantId: params.merchantId });

  if (!merchant) {
    return <div>Merchant não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{merchant.companyName}</h1>
        <p className="text-gray-600">Workspace ID: {params.merchantId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status de Elegibilidade</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Elegível para Busca:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  eligibility.isEligible
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {eligibility.isEligible ? 'Sim' : 'Não'}
              </span>
            </div>
            {eligibility.reasons.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Motivos:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  {eligibility.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assinatura</h2>
          {merchant.subscriptions[0] ? (
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Plano:</span>
                <p className="font-medium">{merchant.subscriptions[0].plan.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-medium">{merchant.subscriptions[0].status}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma assinatura ativa</p>
          )}
        </div>
      </div>
    </div>
  );
}
