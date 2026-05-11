import Link from 'next/link';
import { Car, Mail, Phone } from 'lucide-react';
import { dealerConfig } from '@/lib/dealer-config';

export function Footer() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${dealerConfig.name} home`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Car className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">{dealerConfig.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
              {dealerConfig.tagline}
              {dealerConfig.city && dealerConfig.country && (
                <> · {dealerConfig.city}, {dealerConfig.country}</>
              )}
            </p>

            {/* Contact info */}
            <div className="mt-4 space-y-1.5">
              {dealerConfig.email && (
                <a
                  href={`mailto:${dealerConfig.email}`}
                  className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {dealerConfig.email}
                </a>
              )}
              {dealerConfig.phone && (
                <a
                  href={`tel:${dealerConfig.phone}`}
                  className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {dealerConfig.phone}
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
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

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Dealership</p>
            <ul className="space-y-2">
              {[
                { href: '#', label: `About ${dealerConfig.name}` },
                { href: '#', label: 'Financing Options' },
                { href: '#', label: 'Trade-In Valuation' },
                ...(dealerConfig.email ? [{ href: `mailto:${dealerConfig.email}`, label: 'Contact Us' }] : []),
                ...(dealerConfig.phone ? [{
                  href: `https://wa.me/${dealerConfig.phone.replace(/\D/g, '')}`,
                  label: 'WhatsApp Us',
                }] : []),
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/60 transition-colors hover:text-white" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {dealerConfig.name}. All rights reserved.
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
