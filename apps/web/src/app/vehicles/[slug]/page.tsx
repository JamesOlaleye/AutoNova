import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Car, Gauge, Fuel, GitFork, Calendar, Palette, MessageCircle } from 'lucide-react';
import { getVehicle } from '@/lib/api/vehicles';
import { EnquiryForm } from './_components/enquiry-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatMileage, idFromSlug } from '@/lib/utils';
import { CONDITION_LABEL, FUEL_LABEL, TRANSMISSION_LABEL } from '@/constants/vehicle.constants';
import type { VehicleCondition } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CONDITION_BADGE: Record<VehicleCondition, 'success' | 'info' | 'warning'> = {
  NEW: 'success', USED: 'info', CERTIFIED_USED: 'warning',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = idFromSlug(slug);
  try {
    const vehicle = await getVehicle(id);
    return {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description: vehicle.description
        ?? `${CONDITION_LABEL[vehicle.condition as VehicleCondition] ?? vehicle.condition} ${vehicle.fuelType} ${vehicle.transmission.toLowerCase()} — ${formatCurrency(vehicle.price, vehicle.currency)}`,
      openGraph: {
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        description: `${formatCurrency(vehicle.price, vehicle.currency)} · ${formatMileage(vehicle.mileage, vehicle.mileageUnit)}`,
      },
    };
  } catch {
    return { title: 'Vehicle Not Found' };
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let vehicle;
  try {
    vehicle = await getVehicle(id);
  } catch {
    notFound();
  }

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const conditionVariant = CONDITION_BADGE[vehicle.condition as VehicleCondition] ?? 'info';

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: vehicleName,
    color: vehicle.color,
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: vehicle.mileageUnit === 'KM' ? 'KMT' : 'SMI',
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: vehicle.currency,
      availability: vehicle.status === 'AVAILABLE'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
    },
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: String(vehicle.year) },
    { icon: Gauge, label: 'Mileage', value: formatMileage(vehicle.mileage, vehicle.mileageUnit) },
    { icon: Fuel, label: 'Fuel', value: FUEL_LABEL[vehicle.fuelType] ?? vehicle.fuelType },
    { icon: GitFork, label: 'Transmission', value: TRANSMISSION_LABEL[vehicle.transmission] ?? vehicle.transmission },
    { icon: Palette, label: 'Colour', value: vehicle.color },
    { icon: Car, label: 'Drive', value: vehicle.driveType },
  ];

  if (vehicle.engineSize) {
    specs.push({ icon: Car, label: 'Engine', value: vehicle.engineSize });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back to inventory
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left — image + specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery placeholder */}
            <div
              className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 sm:h-80 lg:h-96"
              aria-label={`Photo of ${vehicleName}`}
            >
              <Car className="h-24 w-24 text-slate-300" aria-hidden="true" />
            </div>

            {/* Title + price */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={conditionVariant}>
                  {CONDITION_LABEL[vehicle.condition as VehicleCondition] ?? vehicle.condition}
                </Badge>
                {vehicle.status === 'RESERVED' && (
                  <Badge variant="warning">Reserved</Badge>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {vehicleName}
              </h1>
              <p className="mt-2 text-3xl font-bold tracking-tight text-primary">
                {formatCurrency(vehicle.price, vehicle.currency)}
              </p>
            </div>

            {/* Specs grid */}
            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="mb-3 text-base font-semibold text-foreground">
                Specifications
              </h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-foreground">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            {/* VIN */}
            {vehicle.vin && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">VIN:</span> {vehicle.vin}
              </p>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="mb-3 text-base font-semibold text-foreground">Features</h2>
                <ul className="flex flex-wrap gap-2" role="list">
                  {vehicle.features.map((feat) => (
                    <li key={feat}>
                      <Badge variant="outline" className="text-xs">{feat}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            {vehicle.description && (
              <section aria-labelledby="desc-heading">
                <h2 id="desc-heading" className="mb-3 text-base font-semibold text-foreground">Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </section>
            )}
          </div>

          {/* Right — enquiry form */}
          <aside aria-labelledby="enquiry-heading" className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 id="enquiry-heading" className="mb-1 text-base font-semibold text-foreground">
                Interested in this vehicle?
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Send an enquiry and we&apos;ll get back to you promptly.
              </p>
              <EnquiryForm vehicleId={vehicle.id} vehicleName={vehicleName} />

              {/* WhatsApp CTA */}
              <div className="mt-4 border-t pt-4">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full gap-2 text-sm text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in the ${vehicleName}. Can you provide more details?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Contact dealer about ${vehicleName} on WhatsApp`}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
