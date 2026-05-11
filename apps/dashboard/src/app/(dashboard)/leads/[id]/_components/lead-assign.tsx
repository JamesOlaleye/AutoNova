'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUiStore } from '@/store/ui.store';
import { assignLeadAction } from '@/app/(dashboard)/actions';
import type { User } from '@/types';

interface LeadAssignProps {
  leadId: string;
  currentAssignedTo: string | null;
  agents: User[];
}

export function LeadAssign({ leadId, currentAssignedTo, agents }: LeadAssignProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  function handleChange(value: string) {
    startTransition(async () => {
      const assignedTo = value === '__unassigned__' ? null : value;
      const result = await assignLeadAction(leadId, assignedTo);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast(
          assignedTo
            ? 'Lead assigned successfully'
            : 'Lead unassigned',
          'success',
        );
        router.refresh();
      }
    });
  }

  const assignableAgents = agents.filter((u) =>
    ['SALES_AGENT', 'DEALER_ADMIN', 'FINANCE_MANAGER'].includes(u.role),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Assigned To</p>
      </div>
      <Select
        value={currentAssignedTo ?? '__unassigned__'}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger className="h-9 text-sm" aria-label="Assign lead to a team member">
          <SelectValue placeholder="Unassigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__unassigned__">
            <span className="text-muted-foreground">Unassigned</span>
          </SelectItem>
          {assignableAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.firstName} {agent.lastName}
              <span className="ml-1 text-xs text-muted-foreground">
                ({agent.role === 'DEALER_ADMIN' ? 'Admin' : agent.role === 'SALES_AGENT' ? 'Sales' : 'Finance'})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
