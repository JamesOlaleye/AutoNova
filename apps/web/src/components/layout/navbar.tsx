'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Menu, X, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DealerProfile } from '@/types';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/vehicles', label: 'Browse Vehicles' },
  { href: '/about', label: 'About' },
  { href: '/financing', label: 'Finance Calculator' },
  { href: '/trade-in', label: 'Trade-In' },
];

export function Navbar({ dealer }: { dealer: DealerProfile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${dealer.name} home`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Car className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">{dealer.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild size="sm" variant="ghost">
            <Link href="/wishlist" aria-label="Saved vehicles">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/vehicles">View Inventory</Link>
          </Button>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-1 lg:hidden">
          <Button asChild size="sm" variant="ghost" className="h-10 w-10 p-0">
            <Link href="/wishlist" aria-label="Saved vehicles">
              <Heart className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? <X className="h-5 w-5" aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-16 z-40 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <nav
            className="absolute left-0 right-0 top-full z-50 border-b bg-white p-4 shadow-lg lg:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="space-y-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-4">
              <Button asChild className="w-full">
                <Link href="/vehicles" onClick={() => setMobileOpen(false)}>
                  Browse All Vehicles
                </Link>
              </Button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
