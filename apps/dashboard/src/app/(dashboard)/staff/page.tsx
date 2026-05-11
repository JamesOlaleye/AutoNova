import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, UsersRound } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getUsers } from '@/lib/api/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { StaffRoleSelect } from './_components/staff-role-select';
import { StaffActions } from './_components/staff-actions';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types';

export const metadata: Metadata = { title: 'Team' };

const ROLE_BADGE: Record<UserRole, { label: string; class: string }> = {
  DEALER_ADMIN:    { label: 'Admin',          class: 'bg-blue-50 text-blue-700 border-blue-200' },
  SALES_AGENT:     { label: 'Sales Agent',    class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FINANCE_MANAGER: { label: 'Finance',        class: 'bg-violet-50 text-violet-700 border-violet-200' },
  PLATFORM_ADMIN:  { label: 'Platform Admin', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  CUSTOMER:        { label: 'Customer',       class: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

export default async function StaffPage() {
  const session = await getSession();
  const { data: members, total } = await getUsers(session!.token, session!.tenantId);

  const staffMembers = members.filter((u) => u.role !== 'CUSTOMER');
  const isAdmin = ['DEALER_ADMIN', 'PLATFORM_ADMIN'].includes(session!.user.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={`${staffMembers.length} team member${staffMembers.length !== 1 ? 's' : ''} in your dealership`}
        actions={
          isAdmin ? (
            <Button asChild className="gap-2">
              <Link href="/staff/invite">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Invite Staff
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {staffMembers.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No team members yet"
            description="Invite sales agents and finance managers to collaborate on your dealership."
            action={
              isAdmin ? (
                <Button asChild className="gap-2">
                  <Link href="/staff/invite">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Invite first team member
                  </Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-muted/40 px-5 py-2.5 sm:grid-cols-[1fr_160px_auto]">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member</p>
              <p className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">Role</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</p>
            </div>

            {staffMembers.map((member: User) => {
              const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
              const avatarClass = AVATAR_COLORS[member.id.charCodeAt(0) % AVATAR_COLORS.length];
              const roleBadge = ROLE_BADGE[member.role as UserRole];
              const isSelf = member.id === session!.user.id;

              return (
                <div key={member.id} className={cn(
                  'grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[1fr_160px_auto]',
                  !member.isActive && 'opacity-60',
                )}>
                  {/* Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', avatarClass)}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        {!member.isActive && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Inactive
                          </span>
                        )}
                        {/* Mobile role badge */}
                        <span className={cn('sm:hidden inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', roleBadge?.class)}>
                          {roleBadge?.label ?? member.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      {member.phone && (
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Role selector — desktop */}
                  <div className="hidden sm:block">
                    {isAdmin && !isSelf ? (
                      <StaffRoleSelect
                        userId={member.id}
                        currentRole={member.role}
                        disabled={!member.isActive}
                      />
                    ) : (
                      <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', roleBadge?.class)}>
                        {roleBadge?.label ?? member.role}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {isAdmin ? (
                    <StaffActions member={member} currentUserId={session!.user.id} />
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isAdmin && (
        <p className="text-center text-xs text-muted-foreground">
          Only Dealer Admins can invite or manage team members.
        </p>
      )}
    </div>
  );
}
