'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateLeadStatusAction } from '@/app/(dashboard)/actions';
import { useUiStore } from '@/store/ui.store';
import { LEAD_STATUSES } from '@/constants/lead.constants';
import type { Lead } from '@/types';

export function LeadStatusUpdate({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateLeadStatusAction(lead.id, status);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Lead status updated', 'success');
        router.refresh();
      }
    });
  }

  return (
    <div className="w-32 shrink-0">
      <Select defaultValue={lead.status} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className={`h-8 text-xs ${isPending ? 'opacity-60' : ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value} className="text-xs">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
