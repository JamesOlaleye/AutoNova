'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { inviteStaffAction } from '@/app/(dashboard)/actions';

const STAFF_ROLES = [
  { value: 'SALES_AGENT',     label: 'Sales Agent — can manage inventory and enquiries' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager — can manage orders and financing' },
  { value: 'DEALER_ADMIN',    label: 'Dealer Admin — full access to everything' },
];

export function InviteStaffForm() {
  const [state, action, pending] = useActionState(inviteStaffAction, null);

  return (
    <form action={action} className="space-y-5" noValidate aria-label="Invite staff member">
      <Card>
        <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First Name <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="firstName" name="firstName" placeholder="James" required autoComplete="given-name" className="h-11 sm:h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last Name <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="lastName" name="lastName" placeholder="Olanipekun" required autoComplete="family-name" className="h-11 sm:h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="email" name="email" type="email" placeholder="james@freshautosworld.com" required autoComplete="email" className="h-11 sm:h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+2348012345678" autoComplete="tel" className="h-11 sm:h-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Access & Credentials</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="select-role">Role <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Select name="role" required>
              <SelectTrigger id="select-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Temporary Password <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="h-11 sm:h-9"
            />
            <p className="text-xs text-muted-foreground">
              Share this password with the staff member. They should change it after first login.
            </p>
          </div>
        </CardContent>
      </Card>

      {state?.error && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={pending} className="h-11 sm:h-9">
          {pending ? 'Sending invite…' : 'Add Team Member'}
        </Button>
        <Button type="button" variant="outline" asChild className="h-11 sm:h-9">
          <Link href="/staff">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
