'use client';

import { useTransition, useState } from 'react';
import { cancelSubscriptionAction } from '@/app/(dashboard)/actions';

export function CancelSubscriptionButton() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (result?.error) setError(result.error);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-destructive"
      >
        Cancel subscription
      </button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      <p className="text-xs text-muted-foreground">Cancel your subscription?</p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="rounded bg-destructive px-2 py-1 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-60"
        >
          {pending ? 'Cancelling…' : 'Yes, cancel'}
        </button>
      </div>
    </div>
  );
}
