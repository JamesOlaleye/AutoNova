'use client';

import { useActionState, useId } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitEnquiryAction } from '@/app/actions';

const ENQUIRY_TYPES = [
  { value: 'INQUIRY', label: 'General Enquiry' },
  { value: 'TEST_DRIVE', label: 'Book Test Drive' },
  { value: 'FINANCING', label: 'Financing Options' },
  { value: 'TRADE_IN', label: 'Trade-In' },
];

export function EnquiryForm({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const [state, action, pending] = useActionState(submitEnquiryAction, null);
  const errorId = useId();

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden="true" />
        <div>
          <p className="font-semibold text-emerald-900">Enquiry sent!</p>
          <p className="mt-1 text-sm text-emerald-700">
            We&apos;ll be in touch with you shortly about the {vehicleName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" aria-label="Vehicle enquiry form" noValidate>
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <div className="space-y-1.5">
        <Label htmlFor="enq-type">Enquiry Type <span className="text-destructive" aria-hidden="true">*</span></Label>
        <Select name="type" defaultValue="INQUIRY" required>
          <SelectTrigger id="enq-type" aria-required="true">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENQUIRY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="enq-name">Full Name <span className="text-destructive" aria-hidden="true">*</span></Label>
        <Input id="enq-name" name="name" placeholder="John Okafor" required autoComplete="name" aria-required="true" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="enq-email">Email Address <span className="text-destructive" aria-hidden="true">*</span></Label>
        <Input id="enq-email" name="email" type="email" placeholder="john@example.com" required autoComplete="email" aria-required="true" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="enq-phone">Phone Number</Label>
        <Input id="enq-phone" name="phone" type="tel" placeholder="+234 800 000 0000" autoComplete="tel" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="enq-message">Message</Label>
        <Textarea
          id="enq-message"
          name="message"
          placeholder={`I'm interested in this ${vehicleName}. Please contact me with more details.`}
          rows={3}
        />
      </div>

      {state?.error && (
        <div id={errorId} role="alert" aria-live="assertive" className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <Button type="submit" className="h-11 w-full" loading={pending}>
        {pending ? 'Sending…' : 'Send Enquiry'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No account needed. We&apos;ll respond within 24 hours.
      </p>
    </form>
  );
}
