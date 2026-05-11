import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Car, Fuel, GitFork, Gauge } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getVehicles } from '@/lib/api/vehicles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { formatCurrency, formatMileage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleStatus } from '@/types';

export const metadata: Metadata = { title: 'Inventory' };

const STATUS_CONFIG: Record<VehicleStatus, { variant: 'success' | 'warning' | 'secondary' | 'info'; dot: string }> = {
  AVAILABLE: { variant: 'success',   dot: 'bg-emerald-500' },
  RESERVED:  { variant: 'warning',   dot: 'bg-amber-500' },
  SOLD:      { variant: 'secondary', dot: 'bg-gray-400' },
  DRAFT:     { variant: 'info',      dot: 'bg-blue-400' },
};

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const config = STATUS_CONFIG[vehicle.status] ?? { variant: 'secondary' as const, dot: 'bg-gray-400' };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Image placeholder */}
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <Car className="h-16 w-16 text-slate-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        {/* Status badge overlay */}
        <div className="absolute left-3 top-3">
          <Badge variant={config.variant} className="gap-1.5 text-xs shadow-sm">
            <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
            {vehicle.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground leading-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{vehicle.color} · {vehicle.condition}</p>

          {/* Price */}
          <p className="mt-3 text-xl font-bold tracking-tight text-foreground">
            {formatCurrency(vehicle.price, vehicle.currency)}
          </p>

          {/* Specs grid */}
          <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              <span>{formatMileage(vehicle.mileage, vehicle.mileageUnit)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Fuel className="h-3.5 w-3.5 shrink-0" />
              <span>{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GitFork className="h-3.5 w-3.5 shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Car className="h-3.5 w-3.5 shrink-0" />
              <span>{vehicle.driveType}</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-4 border-t pt-3">
          <Button asChild variant="ghost" size="sm" className="h-11 w-full justify-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary sm:h-8">
            <Link href={`/inventory/${vehicle.id}`}>View details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function InventoryPage() {
  const session = await getSession();
  const { data: vehicles, total } = await getVehicles(session!.token, session!.tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description={`${total} vehicle${total !== 1 ? 's' : ''} in your catalogue`}
        actions={
          <Button asChild className="gap-2">
            <Link href="/inventory/new">
              <Plus className="h-4 w-4" />
              Add vehicle
            </Link>
          </Button>
        }
      />

      {vehicles.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={Car}
            title="No vehicles yet"
            description="Add your first vehicle to start building your catalogue and attracting buyers."
            action={
              <Button asChild className="gap-2">
                <Link href="/inventory/new">
                  <Plus className="h-4 w-4" />
                  Add first vehicle
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle: Vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
