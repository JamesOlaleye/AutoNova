'use client';

import { useActionState, useId, useCallback } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateVehicleAction } from '@/app/(dashboard)/actions';
import {
  VEHICLE_CONDITIONS,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_DRIVE_TYPES,
  VEHICLE_MILEAGE_UNITS,
  CURRENCIES,
} from '@/constants/vehicle.constants';
import type { Vehicle } from '@/types';

function SelectField({ name, label, placeholder, options, required, defaultValue }: {
  name: string; label: string; placeholder: string;
  options: readonly { value: string; label: string }[];
  required?: boolean; defaultValue?: string;
}) {
  const id = `edit-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </Label>
      <Select name={name} required={required} defaultValue={defaultValue}>
        <SelectTrigger id={id} aria-required={required}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
  const boundAction = useCallback(
    updateVehicleAction.bind(null, vehicle.id),
    [vehicle.id],
  );
  const [state, action, pending] = useActionState(boundAction, null);
  const errorId = useId();

  return (
    <form action={action} className="space-y-5" noValidate aria-label="Edit vehicle form">
      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-make">Make <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="edit-make" name="make" defaultValue={vehicle.make} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-model">Model <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="edit-model" name="model" defaultValue={vehicle.model} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-year">Year <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="edit-year" name="year" type="number" defaultValue={vehicle.year} min="1900" max="2030" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-color">Colour <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="edit-color" name="color" defaultValue={vehicle.color} required />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-price">Price <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="edit-price" name="price" type="number" defaultValue={vehicle.price} min="0" required />
          </div>
          <SelectField name="currency" label="Currency" placeholder="Select currency"
            options={CURRENCIES} required defaultValue={vehicle.currency} />
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">Specifications</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-mileage">Mileage <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="edit-mileage" name="mileage" type="number" defaultValue={vehicle.mileage} min="0" required />
          </div>
          <SelectField name="mileageUnit" label="Mileage Unit" placeholder="Select unit"
            options={VEHICLE_MILEAGE_UNITS} required defaultValue={vehicle.mileageUnit} />
          <SelectField name="condition" label="Condition" placeholder="Select condition"
            options={VEHICLE_CONDITIONS} required defaultValue={vehicle.condition} />
          <SelectField name="transmission" label="Transmission" placeholder="Select transmission"
            options={VEHICLE_TRANSMISSIONS} required defaultValue={vehicle.transmission} />
          <SelectField name="fuelType" label="Fuel Type" placeholder="Select fuel type"
            options={VEHICLE_FUEL_TYPES} required defaultValue={vehicle.fuelType} />
          <SelectField name="driveType" label="Drive Side" placeholder="Select drive side"
            options={VEHICLE_DRIVE_TYPES} required defaultValue={vehicle.driveType} />
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Vehicle Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={vehicle.description ?? ''}
              rows={4}
              placeholder="Describe the vehicle condition, history, and standout features…"
            />
          </div>
        </CardContent>
      </Card>

      {state?.error && (
        <div id={errorId} role="alert" aria-live="assertive"
          className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={pending} className="h-11 sm:h-9">
          {pending ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" asChild className="h-11 sm:h-9">
          <Link href={`/inventory/${vehicle.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
