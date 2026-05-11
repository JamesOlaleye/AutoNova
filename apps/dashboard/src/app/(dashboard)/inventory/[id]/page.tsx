import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft, Car, Gauge, Fuel, GitFork,
  Calendar, Palette, Tag, Hash, Camera, Pencil,
} from 'lucide-react';
import { getSession } from '@/lib/session';
import { getVehicle } from '@/lib/api/vehicles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehicleImageUpload } from './_components/vehicle-image-upload';
import { VehicleStatusUpdate } from './_components/vehicle-status-update';
import { formatCurrency, formatMileage, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CONDITION_LABEL, FUEL_LABEL, TRANSMISSION_LABEL, BODY_TYPE_LABEL } from '@/constants/vehicle.constants';
import type { VehicleStatus } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: 'Vehicle Detail' };
}

const STATUS_CONFIG: Record<VehicleStatus, { variant: 'success' | 'warning' | 'secondary' | 'info'; dot: string; label: string }> = {
  AVAILABLE: { variant: 'success',   dot: 'bg-emerald-500', label: 'Available' },
  RESERVED:  { variant: 'warning',   dot: 'bg-amber-500',   label: 'Reserved' },
  SOLD:      { variant: 'secondary', dot: 'bg-gray-400',    label: 'Sold' },
  DRAFT:     { variant: 'info',      dot: 'bg-blue-400',    label: 'Draft' },
};

const CONDITION_LABEL_MAP: Record<string, string> = {
  NEW: 'New', USED: 'Used', CERTIFIED_USED: 'Certified Used',
};

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const vehicle = await getVehicle(id, session!.token, session!.tenantId).catch(() => null);
  if (!vehicle) notFound();

  const statusConfig = STATUS_CONFIG[vehicle.status] ?? { variant: 'secondary' as const, dot: 'bg-gray-400', label: vehicle.status };

  const specs = [
    { icon: Calendar,  label: 'Year',          value: String(vehicle.year) },
    { icon: Gauge,     label: 'Mileage',        value: formatMileage(vehicle.mileage, vehicle.mileageUnit) },
    { icon: Fuel,      label: 'Fuel Type',      value: FUEL_LABEL[vehicle.fuelType] ?? vehicle.fuelType },
    { icon: GitFork,   label: 'Transmission',   value: TRANSMISSION_LABEL[vehicle.transmission] ?? vehicle.transmission },
    { icon: Palette,   label: 'Colour',         value: vehicle.color },
    { icon: Car,       label: 'Drive Side',      value: vehicle.driveType },
    { icon: Tag,       label: 'Condition',       value: CONDITION_LABEL_MAP[vehicle.condition] ?? vehicle.condition },
    ...(vehicle.bodyType ? [{ icon: Car, label: 'Body Type', value: BODY_TYPE_LABEL[vehicle.bodyType] ?? vehicle.bodyType }] : []),
    ...(vehicle.engineSize ? [{ icon: Car, label: 'Engine', value: vehicle.engineSize }] : []),
    ...(vehicle.vin ? [{ icon: Hash, label: 'VIN', value: vehicle.vin }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Inventory
        </Link>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Added {formatDate(vehicle.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/inventory/${vehicle.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Badge variant={statusConfig.variant} className="gap-1.5 text-sm">
            <span className={cn('h-2 w-2 rounded-full', statusConfig.dot)} aria-hidden="true" />
            {statusConfig.label}
          </Badge>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(vehicle.price, vehicle.currency)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — photos + specs */}
        <div className="space-y-5 lg:col-span-2">

          {/* Photos */}
          <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="photos-heading">
            <div className="mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 id="photos-heading" className="text-sm font-semibold text-foreground">
                Photos
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {vehicle.images?.length ?? 0} {(vehicle.images?.length ?? 0) === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            <VehicleImageUpload
              vehicleId={vehicle.id}
              images={vehicle.images ?? []}
            />
          </section>

          {/* Specifications */}
          <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="specs-heading">
            <h2 id="specs-heading" className="mb-4 text-sm font-semibold text-foreground">Specifications</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3.5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground truncate">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Description */}
          {vehicle.description && (
            <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="mb-3 text-sm font-semibold text-foreground">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </section>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="features-heading">
              <h2 id="features-heading" className="mb-3 text-sm font-semibold text-foreground">Features</h2>
              <ul className="flex flex-wrap gap-2" role="list">
                {vehicle.features.map((feat) => (
                  <li key={feat}>
                    <Badge variant="outline" className="text-xs">{feat}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right — sidebar */}
        <aside className="space-y-5">
          {/* Pricing */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Pricing</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Asking Price</span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(vehicle.price, vehicle.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Currency</span>
                <span className="text-sm font-medium text-foreground">{vehicle.currency}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Listing Status</h2>
            <VehicleStatusUpdate
              vehicleId={vehicle.id}
              currentStatus={vehicle.status as VehicleStatus}
            />
          </div>

          {/* Quick links */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/inventory/${vehicle.id}/edit`}
                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit Vehicle Details
              </Link>
              <Link
                href="/inventory"
                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Car className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Back to Inventory
              </Link>
              <Link
                href="/inventory/new"
                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Car className="h-4 w-4" aria-hidden="true" />
                Add Another Vehicle
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
