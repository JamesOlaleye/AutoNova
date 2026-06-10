'use client';

import { useActionState, useTransition } from 'react';
import { upgradeSubscriptionAction } from '@/app/(dashboard)/actions';

interface Props {
  plan: string;
  label: string;
}

export function UpgradeButton({ plan, label }: Props) {
  const [state, action] = useActionState(upgradeSubscriptionAction, null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => action(formData));
      }}
    >
      <input type="hidden" name="plan" value={plan} />
      {state?.error && (
        <p className="mb-2 text-xs text-destructive" role="alert">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-lg border border-primary bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Redirecting to checkout…' : `Upgrade to ${label}`}
      </button>
    </form>
  );
}
