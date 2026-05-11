import type { Metadata } from 'next';
import { Users, Mail, Phone } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getLeads } from '@/lib/api/leads';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { LeadStatusUpdate } from './_components/lead-status-update';
import { LEAD_TYPES } from '@/constants/lead.constants';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types';

export const metadata: Metadata = { title: 'Enquiries' };

const STATUS_CONFIG: Record<LeadStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'destructive' | 'secondary'; dot: string }> = {
  NEW:       { label: 'New',       variant: 'info',        dot: 'bg-blue-400' },
  CONTACTED: { label: 'Contacted', variant: 'warning',     dot: 'bg-amber-400' },
  QUALIFIED: { label: 'Qualified', variant: 'success',     dot: 'bg-emerald-500' },
  LOST:      { label: 'Lost',      variant: 'destructive', dot: 'bg-red-500' },
  CONVERTED: { label: 'Converted', variant: 'secondary',   dot: 'bg-gray-400' },
};

const TYPE_LABEL = Object.fromEntries(LEAD_TYPES.map((t) => [t.value, t.label]));

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function avatarColor(id: string) {
  const index = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function LeadRow({ lead }: { lead: Lead }) {
  const config = STATUS_CONFIG[lead.status] ?? { label: lead.status, variant: 'secondary' as const, dot: 'bg-gray-400' };

  return (
    <div className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
      {/* Avatar */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        avatarColor(lead.id),
      )}>
        {getInitials(lead.name)}
      </div>

      {/* Main info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{lead.name}</span>
            <Badge variant={config.variant} className="gap-1 text-[11px]">
              <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {TYPE_LABEL[lead.type] ?? lead.type}
            </Badge>
          </div>

          {/* Contact */}
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-3 w-3" aria-hidden="true" />
              <span>{lead.email}</span>
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                <span>{lead.phone}</span>
              </a>
            )}
          </div>

          {/* Message preview */}
          {lead.message && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">
              {lead.message}
            </p>
          )}

          <p className="mt-1.5 text-[11px] text-muted-foreground/60">
            Received {formatDate(lead.createdAt)}
          </p>
        </div>

        {/* Status update */}
        <div className="shrink-0">
          <LeadStatusUpdate lead={lead} />
        </div>
      </div>
    </div>
  );
}

export default async function LeadsPage() {
  const session = await getSession();
  const { data: leads, total } = await getLeads(session!.token, session!.tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Enquiries"
        description={`${total} interested buyer${total !== 1 ? 's' : ''} — customers who enquired about your vehicles`}
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No enquiries yet"
            description="When customers submit an enquiry on your storefront, they appear here. Share your storefront link to start receiving interest."
          />
        ) : (
          <div className="divide-y">
            {/* Table header */}
            <div className="bg-muted/40 px-5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {total} {total === 1 ? 'Lead' : 'Leads'}
              </p>
            </div>
            {leads.map((lead: Lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
