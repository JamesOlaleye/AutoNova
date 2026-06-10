import type { Metadata } from 'next';
import { ChangePasswordForm } from './_components/change-password-form';

export const metadata: Metadata = { title: 'Change Password' };

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Change Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your account password. You will remain signed in.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
