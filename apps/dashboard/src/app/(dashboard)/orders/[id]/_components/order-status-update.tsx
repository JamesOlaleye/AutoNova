'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUiStore } from '@/store/ui.store';
import { updateOrderStatusAction } from '@/app/(dashboard)/actions';
import { ORDER_STATUSES } from '@/constants/order.constants';
import type { Order } from '@/types';

const CLOSED_STATUSES = ['COMPLETED', 'CANCELLED'];

export function OrderStatusUpdate({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  const isClosed = CLOSED_STATUSES.includes(order.status);

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Order status updated', 'success');
        router.refresh();
      }
    });
  }

  if (isClosed) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Order is {order.status.toLowerCase()} — no further status changes allowed.
      </p>
    );
  }

  return (
    <Select defaultValue={order.status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-9 text-sm" aria-label="Update order status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.filter((s) => !CLOSED_STATUSES.includes(s.value)).map((s) => (
          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
        ))}
        {/* Closed statuses are terminal — show separately */}
        <SelectItem value="COMPLETED">Completed ✓</SelectItem>
        <SelectItem value="CANCELLED">Cancelled ✗</SelectItem>
      </SelectContent>
    </Select>
  );
}
