import Link from 'next/link';
import Image from 'next/image';
import { Car, Gauge, Fuel, GitFork, Images } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatMileage, vehicleSlug } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleCondition } from '@/types';

const CONDITION_BADGE: Record<VehicleCondition, 'success' | 'info' | 'warning'> = {
  NEW: 'success',
  USED: 'info',
  CERTIFIED_USED: 'warning',
};

const CONDITION_LABEL: Record<VehicleCondition, string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED_USED: 'Certified',
};

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const slug = vehicleSlug(vehicle);
  const conditionVariant = CONDITION_BADGE[vehicle.condition] ?? 'info';
  const primaryImage = vehicle.images?.[0] ?? null;
  const imageCount = vehicle.images?.length ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <Link
        href={`/vehicles/${slug}`}
        aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        tabIndex={-1}
      >
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.color}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Car className="h-20 w-20 text-slate-300 transition-transform duration-500 group-hover:scale-105" aria-hidden="true" />
            </div>
          )}

          {/* Gradient overlay for legibility of badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant={conditionVariant} className="shadow-sm">
              {CONDITION_LABEL[vehicle.condition]}
            </Badge>
          </div>

          {/* Photo count pill */}
          {imageCount > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
              <Images className="h-3 w-3 text-white" aria-hidden="true" />
              <span className="text-[10px] font-medium text-white">{imageCount}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <Link href={`/vehicles/${slug}`} className="group/title">
            <h2 className="font-semibold text-foreground leading-tight transition-colors group-hover/title:text-primary">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{vehicle.color}</p>

          <p className="mt-3 text-xl font-bold tracking-tight text-foreground">
            {formatCurrency(vehicle.price, vehicle.currency)}
          </p>

          {/* Specs */}
          <dl className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-1.5 text-center">
              <Gauge className="mb-0.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <dt className="sr-only">Mileage</dt>
              <dd className="text-[10px] font-medium text-muted-foreground leading-tight">
                {formatMileage(vehicle.mileage, vehicle.mileageUnit)}
              </dd>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-1.5 text-center">
              <Fuel className="mb-0.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <dt className="sr-only">Fuel type</dt>
              <dd className="text-[10px] font-medium text-muted-foreground leading-tight">
                {vehicle.fuelType}
              </dd>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted/50 px-2 py-1.5 text-center">
              <GitFork className="mb-0.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <dt className="sr-only">Transmission</dt>
              <dd className="text-[10px] font-medium text-muted-foreground leading-tight">
                {vehicle.transmission === 'SEMI_AUTOMATIC'
                  ? 'Semi-Auto'
                  : vehicle.transmission.charAt(0) + vehicle.transmission.slice(1).toLowerCase()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 border-t pt-3">
          <Button asChild variant="outline" size="sm" className="h-11 w-full sm:h-9">
            <Link href={`/vehicles/${slug}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
