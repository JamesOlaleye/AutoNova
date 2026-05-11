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
import { createOrderAction } from '@/app/(dashboard)/actions';
import { ORDER_TYPES, CURRENCIES } from '@/constants/order.constants';
import type { Vehicle, User } from '@/types';

interface CreateOrderFormProps {
  vehicles: Vehicle[];
  agents: User[];
}

function FieldGroup({ id, label, required, children }: {
  id: string; label: string; required?: boolean; children: React.ReactNode;
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

function SelectField({ name, label, placeholder, options, required }: {
  name: string; label: string; placeholder: string;
  options: readonly { value: string; label: string }[]; required?: boolean;
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

export function CreateOrderForm({ vehicles, agents }: CreateOrderFormProps) {
  const [state, action, pending] = useActionState(createOrderAction, null);
  const errorId = useId();

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model} — ${v.currency} ${Number(v.price).toLocaleString()}`,
  }));

  const agentOptions = agents
    .filter((u) => ['SALES_AGENT', 'DEALER_ADMIN', 'FINANCE_MANAGER'].includes(u.role))
    .map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.role === 'SALES_AGENT' ? 'Sales' : u.role === 'DEALER_ADMIN' ? 'Admin' : 'Finance'})`,
    }));

  return (
    <form action={action} className="space-y-5" noValidate aria-label="Create order form">
      {/* Vehicle + Type */}
      <Card>
        <CardHeader><CardTitle className="text-base">Deal Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="select-vehicleId">
              Vehicle <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Select name="vehicleId" required>
              <SelectTrigger id="select-vehicleId">
                <SelectValue placeholder="Select a vehicle from inventory" />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SelectField name="type" label="Order Type" placeholder="Select type" options={ORDER_TYPES} required />
          <SelectField name="currency" label="Currency" placeholder="Select currency" options={CURRENCIES} required />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup id="salePrice" label="Sale Price" required>
            <Input id="salePrice" name="salePrice" type="number" placeholder="15000000" min="1" required />
          </FieldGroup>
          <FieldGroup id="downPayment" label="Down Payment">
            <Input id="downPayment" name="downPayment" type="number" placeholder="3000000" min="0" />
          </FieldGroup>
          <FieldGroup id="financingTerm" label="Financing Term (months)">
            <Input id="financingTerm" name="financingTerm" type="number" placeholder="36" min="1" max="120" />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup id="leadId" label="Linked Enquiry ID">
            <Input id="leadId" name="leadId" placeholder="Optional — paste lead UUID" />
          </FieldGroup>
          {agentOptions.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="select-salesAgentId">Sales Agent</Label>
              <Select name="salesAgentId">
                <SelectTrigger id="select-salesAgentId">
                  <SelectValue placeholder="Assign to agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {agentOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Deal terms, customer preferences, follow-up actions…" rows={3} />
          </div>
        </CardContent>
      </Card>

      {state?.error && (
        <div id={errorId} role="alert" aria-live="assertive" className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={pending} className="h-11 sm:h-9">
          {pending ? 'Creating order…' : 'Create Order'}
        </Button>
        <Button type="button" variant="outline" asChild className="h-11 sm:h-9">
          <Link href="/orders">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
