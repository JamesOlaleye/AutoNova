import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getTenant } from '@/lib/api/tenants';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { StoreProvider } from '@/store/store-provider';
import { Toaster } from '@/components/common/toaster';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  let dealerName: string | null = null;
  try {
    const tenant = await getTenant(session.tenantId, session.token);
    dealerName = tenant.name;
  } catch {
    // Graceful degradation — sidebar still renders without the name
  }

  return (
    <StoreProvider user={session.user} tenantId={session.tenantId}>
      {/* Skip to main content — required for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar dealerName={dealerName} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </StoreProvider>
  );
}
