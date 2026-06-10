import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { adminLogout } from '@/app/actions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">AutoNova Admin</span>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          <NavLink href="/tenants">Tenants</NavLink>
          <NavLink href="/billing">Billing</NavLink>
        </nav>
        <div className="border-t border-gray-200 p-3">
          <p className="mb-2 truncate px-2 text-xs text-gray-500">{session.user.email}</p>
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
          <span className="font-semibold text-gray-900">AutoNova Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </a>
  );
}
