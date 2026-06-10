import type { Metadata } from 'next';
import { MapPin, Mail, Phone, MessageCircle, Clock, Car } from 'lucide-react';
import { getDealerConfig } from '@/lib/dealer-config';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const dealer = await getDealerConfig();
  return {
    title: `About ${dealer.name}`,
    description: `Learn about ${dealer.name} — ${dealer.tagline ?? 'your trusted car dealership'}.`,
  };
}

export default async function AboutPage() {
  const dealer = await getDealerConfig();
  const phone = dealer.phone?.replace(/\D/g, '') ?? '';

  return (
    <div className="container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            About {dealer.name}
          </h1>
          {dealer.tagline && (
            <p className="mt-3 text-lg text-muted-foreground">{dealer.tagline}</p>
          )}
        </div>

        {/* Contact grid */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {dealer.address && (
            <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Address</p>
                <p className="mt-0.5 text-sm text-muted-foreground whitespace-pre-line">{dealer.address}</p>
                {dealer.city && <p className="text-sm text-muted-foreground">{dealer.city}{dealer.country ? `, ${dealer.country}` : ''}</p>}
              </div>
            </div>
          )}

          {dealer.email && (
            <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Email</p>
                <a
                  href={`mailto:${dealer.email}`}
                  className="mt-0.5 text-sm text-primary hover:underline"
                >
                  {dealer.email}
                </a>
              </div>
            </div>
          )}

          {dealer.phone && (
            <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Phone</p>
                <a
                  href={`tel:${dealer.phone}`}
                  className="mt-0.5 text-sm text-primary hover:underline"
                >
                  {dealer.phone}
                </a>
              </div>
            </div>
          )}

          <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Business Hours</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Mon–Fri: 8am – 6pm</p>
              <p className="text-sm text-muted-foreground">Sat: 9am – 4pm</p>
              <p className="text-sm text-muted-foreground">Sun: Closed</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Ready to find your vehicle?</p>
              <p className="text-sm text-muted-foreground">Browse our full inventory online.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/vehicles">Browse Inventory</Link>
            </Button>
            {phone && (
              <Button asChild variant="outline">
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact us on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
