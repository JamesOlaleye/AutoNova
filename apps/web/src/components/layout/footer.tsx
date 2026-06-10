import Link from 'next/link';
import { Car, Mail, Phone } from 'lucide-react';
import type { DealerProfile } from '@/types';

export function Footer({ dealer }: { dealer: DealerProfile }) {
  const phone = dealer.phone?.replace(/\D/g, '') ?? '';

  return (
    <footer className="border-t bg-foreground text-background">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${dealer.name} home`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Car className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">{dealer.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
              {dealer.tagline ?? 'Find your perfect vehicle'}
              {dealer.city && dealer.country && (
                <> · {dealer.city}, {dealer.country}</>
              )}
            </p>

            <div className="mt-4 space-y-1.5">
              {dealer.email && (
                <a
                  href={`mailto:${dealer.email}`}
                  className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {dealer.email}
                </a>
              )}
              {dealer.phone && (
                <a
                  href={`tel:${dealer.phone}`}
                  className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {dealer.phone}
                </a>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Inventory</p>
            <ul className="space-y-2">
              {[
                { href: '/vehicles', label: 'All Vehicles' },
                { href: '/vehicles?condition=NEW', label: 'New Cars' },
                { href: '/vehicles?condition=USED', label: 'Used Cars' },
                { href: '/vehicles?condition=CERTIFIED_USED', label: 'Certified Used' },
                { href: '/vehicles?fuelType=ELECTRIC', label: 'Electric' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dealership */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Dealership</p>
            <ul className="space-y-2">
              {[
                { href: '/about', label: `About ${dealer.name}` },
                { href: '/financing', label: 'Financing Calculator' },
                { href: '/trade-in', label: 'Trade-In Valuation' },
                { href: '/wishlist', label: 'Saved Vehicles' },
                ...(dealer.email ? [{ href: `mailto:${dealer.email}`, label: 'Contact Us' }] : []),
                ...(phone ? [{ href: `https://wa.me/${phone}`, label: 'WhatsApp Us' }] : []),
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {dealer.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-white/40 hover:text-white/80">Privacy</Link>
            <Link href="#" className="text-xs text-white/40 hover:text-white/80">Terms</Link>
            <span className="text-xs text-white/20">
              Powered by <Link href="#" className="hover:text-white/50 transition-colors">AutoNova</Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
