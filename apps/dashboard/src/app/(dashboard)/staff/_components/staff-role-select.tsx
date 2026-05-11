'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUiStore } from '@/store/ui.store';
import { updateStaffRoleAction } from '@/app/(dashboard)/actions';

const ROLES = [
  { value: 'DEALER_ADMIN',    label: 'Dealer Admin' },
  { value: 'SALES_AGENT',     label: 'Sales Agent' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
];

export function StaffRoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  function handleChange(role: string) {
    startTransition(async () => {
      const result = await updateStaffRoleAction(userId, role);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Role updated', 'success');
        router.refresh();
      }
    });
  }

  return (
    <Select
      value={currentRole}
      onValueChange={handleChange}
      disabled={isPending || disabled}
    >
      <SelectTrigger className="h-8 w-36 text-xs" aria-label="Change role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value} className="text-xs">
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
