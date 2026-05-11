'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VEHICLE_CONDITIONS, VEHICLE_FUEL_TYPES, VEHICLE_TRANSMISSIONS } from '@/constants/vehicle.constants';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'mileage_asc', label: 'Lowest Mileage' },
];

function FilterSelect({
  placeholder,
  paramKey,
  options,
}: {
  placeholder: string;
  paramKey: string;
  options: readonly { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? '';

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '__all__') {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    params.delete('page');
    router.push(`${pathname}?${params}`);
  }

  return (
    <Select value={current || '__all__'} onValueChange={handleChange}>
      <SelectTrigger className="h-10 min-w-[140px] text-sm" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VehicleFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasFilters = ['condition', 'fuelType', 'transmission'].some(
    (key) => searchParams.has(key),
  );

  function clearFilters() {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter vehicles">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filter:</span>
        </div>

        <FilterSelect
          placeholder="Condition"
          paramKey="condition"
          options={VEHICLE_CONDITIONS}
        />
        <FilterSelect
          placeholder="Fuel Type"
          paramKey="fuelType"
          options={VEHICLE_FUEL_TYPES}
        />
        <FilterSelect
          placeholder="Transmission"
          paramKey="transmission"
          options={VEHICLE_TRANSMISSIONS}
        />

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 gap-1.5 text-destructive hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? 'vehicle' : 'vehicles'} found
      </p>
    </div>
  );
}
