import type { Metadata } from 'next';
import Link from 'next/link';
import { Car, Search, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { getVehicles } from '@/lib/api/vehicles';
import { VehicleCard } from '@/components/common/vehicle-card';
import { Button } from '@/components/ui/button';
import { getDealerConfig } from '@/lib/dealer-config';
import type { Vehicle } from '@/types';

const features = [
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Filter by make, model, price, mileage, fuel type and more to find exactly what you need.',
  },
  {
    icon: Shield,
    title: 'Verified Dealers',
    description: 'Every dealer on AutoNova is verified. Buy with confidence from trusted professionals.',
  },
  {
    icon: TrendingUp,
    title: 'Best Prices',
    description: 'Competitive market pricing across new, used, and certified pre-owned vehicles.',
  },
];

export default async function HomePage() {
  const [{ data: featured, total }, dealer] = await Promise.all([
    getVehicles({ limit: 6 }),
    getDealerConfig(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground py-20 sm:py-28" aria-labelledby="hero-heading">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          aria-hidden="true"
        />
        <div className="container relative text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              {total > 0 ? `${total}+ vehicles available` : 'Premium vehicles available'}
            </p>
            <h1 id="hero-heading" className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find your perfect<br />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                vehicle today
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/60 leading-relaxed">
              Browse certified inventory from <strong className="text-white/90">{dealer.name}</strong>.
              {dealer.city && ` Based in ${dealer.city}.`}
              {' '}New, used, and certified pre-owned vehicles.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/vehicles">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Browse Inventory
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto">
                <Link href="/vehicles?condition=NEW">View New Cars</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-muted/30 py-12" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" className="sr-only">Why AutoNova</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 rounded-xl p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vehicles */}
      {featured.length > 0 && (
        <section className="py-14" aria-labelledby="featured-heading">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 id="featured-heading" className="text-2xl font-bold tracking-tight text-foreground">
                  Latest Listings
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Freshly added to our inventory
                </p>
              </div>
              <Link
                href="/vehicles"
                className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
              >
                View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((vehicle: Vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button asChild variant="outline">
                <Link href="/vehicles">View all {total} vehicles</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA — contact the dealer */}
      <section className="bg-primary py-16" aria-labelledby="contact-cta-heading">
        <div className="container text-center">
          <div className="mx-auto max-w-xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Car className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
            <h2 id="contact-cta-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Ready to find your car?
            </h2>
            <p className="mt-3 text-base text-white/70 leading-relaxed">
              The team at <strong className="text-white">{dealer.name}</strong> is here to help
              you find the perfect vehicle. Browse our full inventory or get in touch.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="outline" className="w-full border-white/30 bg-white text-primary hover:bg-white/90 sm:w-auto">
                <Link href="/vehicles">Browse Inventory</Link>
              </Button>
              {dealer.phone && (
                <Button asChild size="lg" variant="ghost" className="w-full border border-white/20 text-white hover:bg-white/10 sm:w-auto">
                  <a
                    href={`https://wa.me/${dealer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp ${dealer.name}`}
                  >
                    WhatsApp Us
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
