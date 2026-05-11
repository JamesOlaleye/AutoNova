import Link from 'next/link';
import { Car } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5" aria-label="AutoNova home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Car className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">AutoNova</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
              The platform that powers modern car dealerships. Browse certified inventory from trusted dealers.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Explore</p>
            <ul className="space-y-2">
              {[
                { href: '/vehicles', label: 'Browse Vehicles' },
                { href: '/vehicles?condition=NEW', label: 'New Cars' },
                { href: '/vehicles?condition=USED', label: 'Used Cars' },
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

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Company</p>
            <ul className="space-y-2">
              {[
                { href: '#', label: 'About AutoNova' },
                { href: '#', label: 'For Dealers' },
                { href: '#', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} AutoNova. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-white/40 hover:text-white/80">Privacy</Link>
            <Link href="#" className="text-xs text-white/40 hover:text-white/80">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
