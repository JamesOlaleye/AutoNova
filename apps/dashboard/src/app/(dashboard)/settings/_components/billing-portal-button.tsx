'use client';

import { useTransition, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { openBillingPortalAction } from '@/app/(dashboard)/actions';

export function BillingPortalButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await openBillingPortalAction();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60"
      >
        {pending ? 'Opening…' : 'Manage billing'}
        {!pending && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}
