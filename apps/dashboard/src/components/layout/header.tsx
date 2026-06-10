'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, ChevronDown, Settings, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { logout } from '@/app/(dashboard)/actions';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/common/notification-bell';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/inventory/new': 'Add Vehicle',
  '/inventory/': 'Vehicle Detail',
  '/leads': 'Customer Enquiries',
  '/leads/': 'Enquiry Detail',
  '/orders': 'Orders',
  '/orders/new': 'New Order',
  '/test-drives': 'Test Drives',
  '/staff': 'Team',
  '/staff/invite': 'Invite Staff',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/settings/password': 'Change Password',
  '/customers': 'Customer Profiles',
};

const ROLE_LABELS: Record<string, string> = {
  DEALER_ADMIN: 'Dealer Admin',
  SALES_AGENT: 'Sales Agent',
  FINANCE_MANAGER: 'Finance Manager',
  PLATFORM_ADMIN: 'Platform Admin',
  CUSTOMER: 'Customer',
};

const ROLE_BADGE_CLASS: Record<string, string> = {
  DEALER_ADMIN: 'bg-blue-50 text-blue-700',
  SALES_AGENT: 'bg-emerald-50 text-emerald-700',
  FINANCE_MANAGER: 'bg-violet-50 text-violet-700',
  PLATFORM_ADMIN: 'bg-amber-50 text-amber-700',
};

export function Header() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ??
    'Dashboard';

  function handleLogout() {
    startTransition(async () => {
      clearAuth();
      await logout();
      router.push('/login');
    });
  }

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const roleBadgeClass = ROLE_BADGE_CLASS[user.role] ?? 'bg-gray-50 text-gray-700';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm shadow-border/40 sm:px-6">
      {/* Left — mobile hamburger + page title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — visible on mobile only */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={false}
          aria-controls="mobile-nav"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right — notification bell + user menu */}
      <div className="flex items-center gap-1">
        <NotificationBell />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex min-h-[44px] items-center gap-2 rounded-lg px-2 transition-colors hover:bg-muted sm:px-2.5',
              menuOpen && 'bg-muted',
            )}
            aria-label={`Account menu for ${user.firstName} ${user.lastName}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {/* Avatar */}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-sm"
              aria-hidden="true"
            >
              {initials}
            </div>
            {/* Name — hidden on very small screens */}
            <span className="hidden text-sm font-medium text-foreground sm:block">
              {user.firstName}
            </span>
            <ChevronDown
              className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', menuOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border bg-card shadow-xl animate-fade-in"
                role="menu"
                aria-label="Account menu"
              >
                {/* Profile */}
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <span className={cn('mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', roleBadgeClass)}>
                    {roleLabel}
                  </span>
                </div>

                {/* Menu items */}
                <div className="p-1" role="none">
                  <button
                    className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Account settings
                  </button>
                  <div className="my-1 border-t" role="separator" />
                  <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {isPending ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
