import { ReactNode } from 'react';
import { getMerchantSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function ConsoleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { merchantId: string };
}) {
  const session = await getMerchantSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Verificar se o usuário tem acesso a este merchant
  const hasAccess =
    session.merchantId === params.merchantId ||
    session.merchantIds?.includes(params.merchantId);

  if (!hasAccess) {
    redirect('/console');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Console Begoo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.email}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
