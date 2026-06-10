'use client';

import Link from 'next/link';
import { GitCompareArrows, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/store/compare.store';

export function CompareBar() {
  const { ids, clear } = useCompareStore();

  if (ids.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border bg-foreground px-5 py-2.5 shadow-xl"
      role="status"
      aria-live="polite"
    >
      <GitCompareArrows className="h-4 w-4 text-white/70" aria-hidden="true" />
      <span className="text-sm font-medium text-white">
        {ids.length} vehicle{ids.length > 1 ? 's' : ''} selected
      </span>
      <Button asChild size="sm" className="h-7 rounded-full px-3 text-xs">
        <Link href={`/vehicles/compare?ids=${ids.join(',')}`}>Compare</Link>
      </Button>
      <button
        onClick={clear}
        className="text-white/50 hover:text-white transition-colors"
        aria-label="Clear comparison"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
