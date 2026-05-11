'use client';

import { useActionState, useId } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createVehicleAction } from '@/app/(dashboard)/actions';
import {
  VEHICLE_CONDITIONS,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_DRIVE_TYPES,
  VEHICLE_MILEAGE_UNITS,
  CURRENCIES,
} from '@/constants/vehicle.constants';

function SelectField({
  name,
  label,
  placeholder,
  options,
  required,
}: {
  name: string;
  label: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
}) {
  const id = `select-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </Label>
      <Select name={name} required={required}>
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

function FieldGroup({ id, label, required, children }: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function AddVehicleForm() {
  const [state, action, pending] = useActionState(createVehicleAction, null);
  const errorId = useId();

  return (
    <form action={action} className="space-y-5" noValidate aria-label="Add vehicle form">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup id="make" label="Make" required>
            <Input id="make" name="make" placeholder="e.g. Toyota" required autoComplete="off" />
          </FieldGroup>
          <FieldGroup id="model" label="Model" required>
            <Input id="model" name="model" placeholder="e.g. Camry" required autoComplete="off" />
          </FieldGroup>
          <FieldGroup id="year" label="Year" required>
            <Input id="year" name="year" type="number" placeholder="2022" min="1900" max="2030" required />
          </FieldGroup>
          <FieldGroup id="color" label="Colour" required>
            <Input id="color" name="color" placeholder="e.g. White" required />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup id="price" label="Price" required>
            <Input id="price" name="price" type="number" placeholder="15000000" min="0" required />
          </FieldGroup>
          <SelectField
            name="currency"
            label="Currency"
            placeholder="Select currency"
            options={CURRENCIES}
            required
          />
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup id="mileage" label="Mileage" required>
            <Input id="mileage" name="mileage" type="number" placeholder="45000" min="0" required />
          </FieldGroup>
          <SelectField name="mileageUnit" label="Mileage Unit" placeholder="Select unit" options={VEHICLE_MILEAGE_UNITS} required />
          <SelectField name="condition" label="Condition" placeholder="Select condition" options={VEHICLE_CONDITIONS} required />
          <SelectField name="transmission" label="Transmission" placeholder="Select transmission" options={VEHICLE_TRANSMISSIONS} required />
          <SelectField name="fuelType" label="Fuel Type" placeholder="Select fuel type" options={VEHICLE_FUEL_TYPES} required />
          <SelectField name="driveType" label="Drive Side" placeholder="Select drive side" options={VEHICLE_DRIVE_TYPES} required />
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="description">Vehicle Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the vehicle condition, history, and standout features…"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {state?.error && (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={pending} className="h-11 sm:h-9">
          {pending ? 'Adding vehicle…' : 'Add to inventory'}
        </Button>
        <Button type="button" variant="outline" asChild className="h-11 sm:h-9">
          <Link href="/inventory">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
