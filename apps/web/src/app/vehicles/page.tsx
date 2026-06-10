import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Car } from 'lucide-react';
import { getVehicles } from '@/lib/api/vehicles';
import { VehicleCard } from '@/components/common/vehicle-card';
import { VehicleFilterSidebar, VehicleFilterBar } from './_components/vehicle-filters';
import { Pagination } from '@/components/common/pagination';
import { EmptyState } from '@/components/common/empty-state';
import type { Vehicle } from '@/types';

export const metadata: Metadata = {
  title: 'Browse Vehicles',
  description: 'Search and filter our full inventory of new, used, and certified pre-owned vehicles.',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function VehiclesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 12;

  const { data: vehicles, total, totalPages } = await getVehicles({
    page,
    limit,
    condition: params.condition,
    fuelType: params.fuelType,
    transmission: params.transmission,
    bodyType: params.bodyType,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  });

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Browse Vehicles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Certified inventory from verified dealers
        </p>
      </div>

      {/* Mobile filter bar (hidden on lg+) */}
      <div className="mb-6 lg:hidden">
        <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-lg bg-muted" />}>
          <VehicleFilterBar total={total} />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar (hidden below lg) */}
        <div className="hidden lg:block">
          <Suspense fallback={<div className="w-56 space-y-4"><div className="h-6 animate-pulse rounded bg-muted" /><div className="h-32 animate-pulse rounded bg-muted" /></div>}>
            <VehicleFilterSidebar total={total} />
          </Suspense>
        </div>

        {/* Vehicle grid */}
        <div className="min-w-0 flex-1">
          {vehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No vehicles found"
              description="Try adjusting your filters — there may be more vehicles available with different criteria."
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle: Vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Suspense>
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </Suspense>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
