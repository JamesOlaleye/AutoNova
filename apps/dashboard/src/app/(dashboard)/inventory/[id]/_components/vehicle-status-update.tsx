'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUiStore } from '@/store/ui.store';
import { updateVehicleStatusAction } from '@/app/(dashboard)/actions';
import { VEHICLE_STATUSES } from '@/constants/vehicle.constants';
import type { VehicleStatus } from '@/types';

const LIFECYCLE: VehicleStatus[] = ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD'];

export function VehicleStatusUpdate({ vehicleId, currentStatus }: {
  vehicleId: string;
  currentStatus: VehicleStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateVehicleStatusAction(vehicleId, status);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Vehicle status updated', 'success');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="h-9 text-sm" aria-label="Change vehicle status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VEHICLE_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Visual pipeline */}
      <div className="space-y-1.5">
        {LIFECYCLE.map((s, i) => {
          const currentIndex = LIFECYCLE.indexOf(currentStatus);
          const isActive = s === currentStatus;
          const isPast = i < currentIndex;
          const dotColors: Record<VehicleStatus, string> = {
            DRAFT: 'bg-blue-400', AVAILABLE: 'bg-emerald-500',
            RESERVED: 'bg-amber-500', SOLD: 'bg-gray-400',
          };
          return (
            <div key={s} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs ${isActive ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground'}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${isActive || isPast ? dotColors[s] : 'bg-muted-foreground/20'}`} aria-hidden="true" />
              {s.charAt(0) + s.slice(1).toLowerCase()}
              {isActive && <span className="ml-auto text-[10px] font-medium text-primary">Current</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
