'use client';

import { useActionState } from 'react';
import { CheckCircle } from 'lucide-react';
import { changePasswordAction } from '@/app/(dashboard)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null);

  if (state?.success) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <CheckCircle className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Password changed successfully</p>
          <p className="text-xs text-emerald-700">Your new password is active.</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3" role="alert">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={state?.error ? 'pw-error' : undefined}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Changing…' : 'Change Password'}
      </Button>
    </form>
  );
}
