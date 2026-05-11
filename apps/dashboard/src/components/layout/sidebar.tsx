'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigation } from '@/config/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Car className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight">AutoNova</span>
            <span className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">Dealer Hub</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
        {navigation.map((group, gi) => {
          const visibleItems = user?.role
            ? group.items.filter((item) => !item.roles || item.roles.includes(user.role))
            : group.items;

          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} className={cn('mb-4', gi > 0 && 'mt-2')}>
              {group.label && (
                <p
                  className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30"
                  aria-hidden="true"
                >
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5" role="list">
                {visibleItems.map(({ href, label, icon: Icon, disabled, badge }) => {
                  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={disabled ? '#' : href}
                        onClick={(e) => {
                          if (disabled) { e.preventDefault(); return; }
                          onClose?.();
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        aria-disabled={disabled}
                        className={cn(
                          'group flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                          disabled && 'pointer-events-none opacity-40',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80',
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex-1 truncate">{label}</span>
                        {badge && (
                          <span className="rounded-full bg-sidebar-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/40">
                            {badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User summary */}
      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary"
              aria-hidden="true"
            >
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground/80">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[10px] text-sidebar-foreground/40">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside
        className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileNavOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar shadow-2xl lg:hidden animate-slide-in-left"
            aria-label="Mobile navigation"
            aria-modal="true"
            role="dialog"
          >
            <SidebarContent onClose={() => setMobileNavOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
