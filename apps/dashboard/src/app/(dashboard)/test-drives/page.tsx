import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarCheck, Clock, Mail, Phone, Car } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getLeads } from '@/lib/api/leads';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types';

export const metadata: Metadata = { title: 'Test Drives' };

function formatDayHeading(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';

  return date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
}

function groupByDate(leads: Lead[]): Map<string, Lead[]> {
  const groups = new Map<string, Lead[]>();
  for (const lead of leads) {
    if (!lead.scheduledAt) continue;
    const day = new Date(lead.scheduledAt).toDateString();
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(lead);
  }
  return groups;
}

const STATUS_DOT: Record<string, string> = {
  NEW: 'bg-blue-400', CONTACTED: 'bg-amber-400', QUALIFIED: 'bg-emerald-500',
  LOST: 'bg-red-500', CONVERTED: 'bg-gray-400',
};

export default async function TestDrivesPage() {
  const session = await getSession();

  // Fetch all TEST_DRIVE leads with large limit to get all scheduled ones
  const { data: allLeads } = await getLeads(session!.token, session!.tenantId, {
    type: 'TEST_DRIVE',
    limit: 200,
  });

  const now = new Date();

  // Separate upcoming vs past
  const scheduled = allLeads
    .filter((l) => l.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const upcoming = scheduled.filter((l) => new Date(l.scheduledAt!) >= now);
  const past = scheduled.filter((l) => new Date(l.scheduledAt!) < now).reverse();
  const unscheduled = allLeads.filter((l) => !l.scheduledAt);

  const upcomingGroups = groupByDate(upcoming);
  const pastGroups = groupByDate(past);

  if (allLeads.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test Drives</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scheduled customer test drives</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={CalendarCheck}
            title="No test drive enquiries yet"
            description="When customers request a test drive on your storefront, they appear here for scheduling."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test Drives</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {upcoming.length} upcoming · {past.length} past · {unscheduled.length} awaiting schedule
        </p>
      </div>

      {/* Awaiting schedule */}
      {unscheduled.length > 0 && (
        <section aria-labelledby="unscheduled-heading">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <h2 id="unscheduled-heading" className="text-sm font-semibold text-foreground">
              Awaiting Schedule ({unscheduled.length})
            </h2>
          </div>
          <div className="rounded-xl border bg-amber-50 border-amber-200 overflow-hidden divide-y divide-amber-100">
            {unscheduled.map((lead) => (
              <TestDriveRow key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingGroups.size > 0 && (
        <section aria-labelledby="upcoming-heading">
          <div className="mb-3 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            <h2 id="upcoming-heading" className="text-sm font-semibold text-foreground">
              Upcoming ({upcoming.length})
            </h2>
          </div>
          <div className="space-y-4">
            {Array.from(upcomingGroups.entries()).map(([day, leads]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatDayHeading(leads[0].scheduledAt!)}
                </p>
                <div className="rounded-xl border bg-card overflow-hidden divide-y shadow-sm">
                  {leads.map((lead) => (
                    <TestDriveRow key={lead.id} lead={lead} showTime />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {pastGroups.size > 0 && (
        <section aria-labelledby="past-heading">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 id="past-heading" className="text-sm font-semibold text-muted-foreground">
              Past ({past.length})
            </h2>
          </div>
          <div className="space-y-4 opacity-70">
            {Array.from(pastGroups.entries()).map(([day, leads]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatDayHeading(leads[0].scheduledAt!)}
                </p>
                <div className="rounded-xl border bg-card overflow-hidden divide-y shadow-sm">
                  {leads.map((lead) => (
                    <TestDriveRow key={lead.id} lead={lead} showTime />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TestDriveRow({ lead, showTime }: { lead: Lead; showTime?: boolean }) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
    >
      {/* Time */}
      {showTime && lead.scheduledAt && (
        <div className="shrink-0 w-14 text-center">
          <p className="text-sm font-bold text-foreground">{formatTime(lead.scheduledAt)}</p>
        </div>
      )}

      {/* Customer avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {lead.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{lead.name}</p>
          <div className={cn('h-2 w-2 rounded-full', STATUS_DOT[lead.status] ?? 'bg-gray-400')} aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{lead.status}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" aria-hidden="true" /> {lead.email}
          </span>
          {lead.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" aria-hidden="true" /> {lead.phone}
            </span>
          )}
        </div>
      </div>

      {/* Vehicle indicator */}
      {lead.vehicleId && (
        <div className="shrink-0">
          <Car className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </Link>
  );
}
