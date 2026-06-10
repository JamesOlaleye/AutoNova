import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft, Mail, Phone, MessageCircle,
  Calendar, ChevronRight, Contact,
} from 'lucide-react';
import { getSession } from '@/lib/session';
import { getLeads } from '@/lib/api/leads';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { LEAD_TYPES } from '@/constants/lead.constants';
import type { Lead, LeadStatus } from '@/types';

interface PageProps {
  params: Promise<{ email: string }>;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'destructive' | 'secondary'; dot: string }> = {
  NEW:       { label: 'New',       variant: 'info',        dot: 'bg-blue-400' },
  CONTACTED: { label: 'Contacted', variant: 'warning',     dot: 'bg-amber-400' },
  QUALIFIED: { label: 'Qualified', variant: 'success',     dot: 'bg-emerald-500' },
  LOST:      { label: 'Lost',      variant: 'destructive', dot: 'bg-red-500' },
  CONVERTED: { label: 'Converted', variant: 'secondary',   dot: 'bg-gray-400' },
};

const TYPE_LABEL = Object.fromEntries(LEAD_TYPES.map((t) => [t.value, t.label]));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { email } = await params;
  return { title: `Customer — ${decodeURIComponent(email)}` };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);

  const session = await getSession();
  if (!session) return null;

  const { data: allLeads } = await getLeads(session.token, session.tenantId, { limit: 500 });

  const leads = allLeads
    .filter((l) => l.email === email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (leads.length === 0) notFound();

  const name = leads[0].name;
  const phone = leads.find((l) => l.phone)?.phone ?? null;
  const firstContact = leads[leads.length - 1].createdAt;
  const lastContact = leads[0].createdAt;
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const converted = leads.filter((l) => l.status === 'CONVERTED').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Customer Profiles
        </Link>
      </nav>

      {/* Customer header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {initials}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {email}
              </a>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {phone}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 gap-6 sm:flex-col sm:items-end sm:gap-2">
            <div className="text-center sm:text-right">
              <p className="text-2xl font-bold text-foreground">{leads.length}</p>
              <p className="text-xs text-muted-foreground">{leads.length === 1 ? 'enquiry' : 'enquiries'}</p>
            </div>
            {converted > 0 && (
              <Badge variant="success" className="text-xs">
                {converted} converted
              </Badge>
            )}
          </div>
        </div>

        {/* Timeline strip */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            First contact: <span className="font-medium text-foreground">{formatDate(firstContact)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Last contact: <span className="font-medium text-foreground">{formatDate(lastContact)}</span>
          </div>
        </div>
      </div>

      {/* Enquiry history */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Enquiry History
        </h2>

        {leads.length === 0 ? (
          <EmptyState
            icon={Contact}
            title="No enquiries"
            description="This customer has no enquiry history."
          />
        ) : (
          <div className="divide-y rounded-xl border bg-card shadow-sm overflow-hidden">
            {leads.map((lead) => {
              const config = STATUS_CONFIG[lead.status] ?? { label: lead.status, variant: 'secondary' as const, dot: 'bg-gray-400' };
              return (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex min-h-[72px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  {/* Type indicator */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {TYPE_LABEL[lead.type] ?? lead.type}
                      </span>
                      <Badge variant={config.variant} className="gap-1 text-[11px]">
                        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
                        {config.label}
                      </Badge>
                    </div>
                    {lead.message && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{lead.message}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground/60">{formatDate(lead.createdAt)}</p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
