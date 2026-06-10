'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VEHICLE_CONDITIONS, VEHICLE_FUEL_TYPES, VEHICLE_TRANSMISSIONS, VEHICLE_BODY_TYPES } from '@/constants/vehicle.constants';

function FilterSelect({
  label,
  paramKey,
  options,
}: {
  label: string;
  paramKey: string;
  options: readonly { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? '';

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '__all__') params.delete(paramKey);
    else params.set(paramKey, value);
    params.delete('page');
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={current || '__all__'} onValueChange={handleChange}>
        <SelectTrigger className="h-9 text-sm" aria-label={label}>
          <SelectValue placeholder={`All ${label}s`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All {label}s</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PriceRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleBlur(key: 'minPrice' | 'maxPrice', value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const num = parseInt(value, 10);
    if (!value || isNaN(num) || num <= 0) params.delete(key);
    else params.set(key, String(num));
    params.delete('page');
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">Price Range</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          defaultValue={searchParams.get('minPrice') ?? ''}
          className="h-9 text-sm"
          min={0}
          onBlur={(e) => handleBlur('minPrice', e.target.value)}
          aria-label="Minimum price"
        />
        <span className="text-xs text-muted-foreground shrink-0">to</span>
        <Input
          type="number"
          placeholder="Max"
          defaultValue={searchParams.get('maxPrice') ?? ''}
          className="h-9 text-sm"
          min={0}
          onBlur={(e) => handleBlur('maxPrice', e.target.value)}
          aria-label="Maximum price"
        />
      </div>
    </div>
  );
}

const FILTER_KEYS = ['condition', 'fuelType', 'transmission', 'bodyType', 'minPrice', 'maxPrice'];

export function VehicleFilterSidebar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k));

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <aside className="w-56 shrink-0 space-y-5" aria-label="Filter vehicles">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-destructive hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSelect label="Condition" paramKey="condition" options={VEHICLE_CONDITIONS} />
      <FilterSelect label="Body Type" paramKey="bodyType" options={VEHICLE_BODY_TYPES} />
      <FilterSelect label="Fuel Type" paramKey="fuelType" options={VEHICLE_FUEL_TYPES} />
      <FilterSelect label="Transmission" paramKey="transmission" options={VEHICLE_TRANSMISSIONS} />
      <PriceRangeFilter />

      <p className="text-xs text-muted-foreground pt-2 border-t" aria-live="polite">
        {total} {total === 1 ? 'vehicle' : 'vehicles'} found
      </p>
    </aside>
  );
}

export function VehicleFilterBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter vehicles">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filter:</span>
        </div>
        <FilterSelect label="Condition" paramKey="condition" options={VEHICLE_CONDITIONS} />
        <FilterSelect label="Body Type" paramKey="bodyType" options={VEHICLE_BODY_TYPES} />
        <FilterSelect label="Fuel Type" paramKey="fuelType" options={VEHICLE_FUEL_TYPES} />
        <FilterSelect label="Transmission" paramKey="transmission" options={VEHICLE_TRANSMISSIONS} />
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="h-9 gap-1.5 text-destructive hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>
      <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? 'vehicle' : 'vehicles'} found
      </p>
    </div>
  );
}
