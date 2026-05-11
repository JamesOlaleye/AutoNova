import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { InviteStaffForm } from './_components/invite-staff-form';

export const metadata: Metadata = { title: 'Invite Staff' };

export default function InviteStaffPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/staff"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to team
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add Team Member</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an account for a new staff member. Share the credentials with them directly.
        </p>
      </div>
      <InviteStaffForm />
    </div>
  );
}
