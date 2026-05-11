'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserX, UserCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui.store';
import { toggleStaffStatusAction, removeStaffAction } from '@/app/(dashboard)/actions';
import type { User } from '@/types';

export function StaffActions({ member, currentUserId }: { member: User; currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  const isSelf = member.id === currentUserId;

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await toggleStaffStatusAction(member.id, !member.isActive);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast(member.isActive ? 'Staff member deactivated' : 'Staff member activated', 'success');
        router.refresh();
      }
    });
  }

  function handleRemove() {
    if (!confirm(`Remove ${member.firstName} ${member.lastName} from the team? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await removeStaffAction(member.id);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Staff member removed', 'success');
        router.refresh();
      }
    });
  }

  if (isSelf) {
    return <span className="text-xs text-muted-foreground italic">You</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${member.isActive ? 'text-muted-foreground hover:text-amber-600' : 'text-muted-foreground hover:text-emerald-600'}`}
        onClick={handleToggleStatus}
        disabled={isPending}
        aria-label={member.isActive ? 'Deactivate staff member' : 'Activate staff member'}
      >
        {member.isActive
          ? <UserX className="h-4 w-4" aria-hidden="true" />
          : <UserCheck className="h-4 w-4" aria-hidden="true" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={handleRemove}
        disabled={isPending}
        aria-label="Remove staff member"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
