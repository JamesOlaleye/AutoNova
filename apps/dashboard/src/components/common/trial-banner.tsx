import Link from 'next/link';
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: Props) {
  const expired = daysLeft <= 0;

  if (expired) {
    return (
      <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-3 sm:px-6 lg:px-8">
        <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-medium text-red-800">
          Your free trial has ended. Upgrade to keep access to your inventory, leads, and orders.
        </p>
        <Link
          href="/settings"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Upgrade now
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6 lg:px-8">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-medium text-amber-800">
        {daysLeft === 1
          ? 'Your free trial ends tomorrow.'
          : `Your free trial ends in ${daysLeft} days.`}{' '}
        Upgrade to Growth or Pro to keep full access.
      </p>
      <Link
        href="/settings"
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        View plans
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
