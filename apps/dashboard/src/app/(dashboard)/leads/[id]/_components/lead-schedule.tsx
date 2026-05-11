'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUiStore } from '@/store/ui.store';
import { scheduleTestDriveAction } from '@/app/(dashboard)/actions';

interface LeadScheduleProps {
  leadId: string;
  scheduledAt: string | null;
}

export function LeadSchedule({ leadId, scheduledAt }: LeadScheduleProps) {
  const [isPending, startTransition] = useTransition();
  const [dateValue, setDateValue] = useState(
    scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : '',
  );
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  function handleSave() {
    if (!dateValue) return;
    startTransition(async () => {
      const result = await scheduleTestDriveAction(leadId, new Date(dateValue).toISOString());
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Test drive scheduled', 'success');
        router.refresh();
      }
    });
  }

  function handleClear() {
    startTransition(async () => {
      const result = await scheduleTestDriveAction(leadId, null);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        setDateValue('');
        addToast('Test drive removed from schedule', 'info');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Test Drive Date & Time</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="scheduledAt" className="sr-only">Test drive date and time</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="h-10 text-sm"
            aria-label="Test drive date and time"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dateValue || isPending}
          loading={isPending}
          className="h-10 shrink-0"
        >
          {scheduledAt ? 'Update' : 'Schedule'}
        </Button>
        {scheduledAt && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClear}
            disabled={isPending}
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Remove test drive from schedule"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {scheduledAt && (
        <p className="text-xs text-muted-foreground">
          Currently scheduled for{' '}
          <span className="font-medium text-foreground">
            {new Date(scheduledAt).toLocaleString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'short',
              year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </p>
      )}
    </div>
  );
}
