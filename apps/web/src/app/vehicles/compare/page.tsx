import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Car, ArrowLeft } from 'lucide-react';
import { getVehicle } from '@/lib/api/vehicles';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatMileage } from '@/lib/utils';
import type { Vehicle } from '@/types';

export const metadata: Metadata = {
  title: 'Compare Vehicles',
  description: 'Compare up to 3 vehicles side-by-side.',
};

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

const SPECS: { label: string; key: keyof Vehicle; format?: (v: Vehicle) => string }[] = [
  { label: 'Price', key: 'price', format: (v) => formatCurrency(v.price, v.currency) },
  { label: 'Year', key: 'year' },
  { label: 'Condition', key: 'condition' },
  { label: 'Body Type', key: 'bodyType' },
  { label: 'Fuel Type', key: 'fuelType' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Mileage', key: 'mileage', format: (v) => formatMileage(v.mileage, v.mileageUnit) },
  { label: 'Drive Side', key: 'driveType' },
  { label: 'Colour', key: 'color' },
  { label: 'Engine', key: 'engineSize' },
  { label: 'VIN', key: 'vin' },
];

export default async function ComparePage({ searchParams }: PageProps) {
  const { ids } = await searchParams;
  const idList = (ids ?? '').split(',').filter(Boolean).slice(0, 3);

  const vehicles = (
    await Promise.allSettled(idList.map((id) => getVehicle(id)))
  )
    .filter((r): r is PromiseFulfilledResult<Vehicle> => r.status === 'fulfilled')
    .map((r) => r.value);

  if (vehicles.length === 0) {
    return (
      <div className="container py-16 text-center">
        <Car className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-foreground">No vehicles selected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the Compare button on vehicle cards to select up to 3 vehicles.
        </p>
        <Button asChild className="mt-6">
          <Link href="/vehicles">Browse Inventory</Link>
        </Button>
      </div>
    );
  }

  const colWidth = vehicles.length === 1 ? 'max-w-xs' : vehicles.length === 2 ? 'w-64' : 'w-52';

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/vehicles">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Compare Vehicles</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" aria-label="Vehicle comparison">
          <thead>
            <tr>
              <th className="w-32 border-b pb-4 text-left text-xs font-medium text-muted-foreground" scope="col" />
              {vehicles.map((v) => (
                <th key={v.id} className={`${colWidth} border-b pb-4 px-3 text-left`} scope="col">
                  <div className="relative mb-3 h-36 overflow-hidden rounded-lg bg-muted">
                    {v.images?.[0] ? (
                      <Image
                        src={v.images[0]}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Car className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/vehicles/${v.id}`}
                    className="block font-semibold text-foreground hover:text-primary leading-tight"
                  >
                    {v.year} {v.make} {v.model}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{v.color}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPECS.map(({ label, key, format }) => (
              <tr key={label} className="group">
                <td className="border-b py-3 pr-4 text-xs font-medium text-muted-foreground group-hover:bg-muted/30">
                  {label}
                </td>
                {vehicles.map((v) => (
                  <td
                    key={v.id}
                    className="border-b px-3 py-3 text-sm text-foreground group-hover:bg-muted/30"
                  >
                    {format
                      ? format(v)
                      : (v[key] != null ? String(v[key]) : '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
