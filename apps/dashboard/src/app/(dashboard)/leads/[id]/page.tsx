import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft, Mail, Phone, Car, Calendar,
  MessageSquare, Clock, Tag,
} from 'lucide-react';
import { getSession } from '@/lib/session';
import { getLead } from '@/lib/api/leads';
import { getVehicle } from '@/lib/api/vehicles';
import { getUsers } from '@/lib/api/users';
import { Badge } from '@/components/ui/badge';
import { LeadStatusUpdate } from '../_components/lead-status-update';
import { LeadAssign } from './_components/lead-assign';
import { LeadNotes } from './_components/lead-notes';
import { formatCurrency, formatDate, formatMileage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { LEAD_TYPES } from '@/constants/lead.constants';
import type { LeadStatus, Vehicle, User } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: 'Enquiry Detail' };
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'destructive' | 'secondary'; dot: string }> = {
  NEW:       { label: 'New',       variant: 'info',        dot: 'bg-blue-400' },
  CONTACTED: { label: 'Contacted', variant: 'warning',     dot: 'bg-amber-400' },
  QUALIFIED: { label: 'Qualified', variant: 'success',     dot: 'bg-emerald-500' },
  LOST:      { label: 'Lost',      variant: 'destructive', dot: 'bg-red-500' },
  CONVERTED: { label: 'Converted', variant: 'secondary',   dot: 'bg-gray-400' },
};

const TYPE_LABEL = Object.fromEntries(LEAD_TYPES.map((t) => [t.value, t.label]));

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const [lead, usersResult] = await Promise.all([
    getLead(id, session!.token, session!.tenantId).catch(() => null),
    getUsers(session!.token, session!.tenantId).catch(() => ({ data: [] as User[] })),
  ]);

  if (!lead) notFound();

  // Fetch linked vehicle if exists
  let vehicle: Vehicle | null = null;
  if (lead.vehicleId) {
    vehicle = await getVehicle(lead.vehicleId, session!.token, session!.tenantId).catch(() => null);
  }

  const users: User[] = usersResult.data;
  const assignedAgent = users.find((u) => u.id === lead.assignedTo);
  const statusConfig = STATUS_CONFIG[lead.status as LeadStatus] ?? { label: lead.status, variant: 'secondary' as const, dot: 'bg-gray-400' };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Enquiries
        </Link>
      </nav>

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold', avatarColor(lead.id))}>
            {getInitials(lead.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{lead.name}</h1>
            <p className="text-sm text-muted-foreground">
              {TYPE_LABEL[lead.type] ?? lead.type} · Received {formatDate(lead.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant={statusConfig.variant} className="gap-1.5 self-start text-sm sm:self-auto">
          <span className={cn('h-2 w-2 rounded-full', statusConfig.dot)} aria-hidden="true" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left — main content */}
        <div className="space-y-5 lg:col-span-2">

          {/* Contact information */}
          <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-4 text-sm font-semibold text-foreground">Contact Information</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${lead.email}`} className="truncate text-sm font-medium text-primary hover:underline">
                      {lead.email}
                    </a>
                  </dd>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</dt>
                    <dd>
                      <a href={`tel:${lead.phone}`} className="text-sm font-medium text-primary hover:underline">
                        {lead.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Enquiry Type</dt>
                  <dd className="text-sm font-medium text-foreground">{TYPE_LABEL[lead.type] ?? lead.type}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Received</dt>
                  <dd className="text-sm font-medium text-foreground">{formatDate(lead.createdAt)}</dd>
                </div>
              </div>
              {lead.scheduledAt && (
                <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 sm:col-span-2">
                  <Calendar className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Test Drive Scheduled</dt>
                    <dd className="text-sm font-medium text-amber-900">{formatDate(lead.scheduledAt)}</dd>
                  </div>
                </div>
              )}
            </dl>
          </section>

          {/* Customer message */}
          {lead.message && (
            <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="message-heading">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 id="message-heading" className="text-sm font-semibold text-foreground">Customer Message</h2>
              </div>
              <blockquote className="border-l-4 border-primary/30 pl-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{lead.message}</p>
              </blockquote>
            </section>
          )}

          {/* Linked vehicle */}
          {vehicle && (
            <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="vehicle-heading">
              <div className="mb-3 flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 id="vehicle-heading" className="text-sm font-semibold text-foreground">Enquired Vehicle</h2>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Car className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(vehicle.price, vehicle.currency)} · {formatMileage(vehicle.mileage, vehicle.mileageUnit)} · {vehicle.condition}
                  </p>
                </div>
                <Link
                  href={`/inventory`}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  View
                </Link>
              </div>
            </section>
          )}

          {/* Internal notes */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <LeadNotes leadId={lead.id} initialNotes={lead.notes} />
          </section>
        </div>

        {/* Right — actions sidebar */}
        <aside className="space-y-5">

          {/* Status */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Pipeline Status</h2>
            <LeadStatusUpdate lead={lead} />
            <div className="mt-4 space-y-1.5">
              {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as LeadStatus[]).map((s, i) => {
                const statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
                const currentIndex = statuses.indexOf(lead.status as LeadStatus);
                const isActive = s === lead.status;
                const isPast = i < currentIndex && lead.status !== 'LOST';
                const cfg = STATUS_CONFIG[s];
                return (
                  <div key={s} className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs',
                    isActive ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground',
                  )}>
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', isActive || isPast ? cfg.dot : 'bg-muted-foreground/30')} aria-hidden="true" />
                    {cfg.label}
                    {isActive && <span className="ml-auto text-[10px] font-medium text-primary">Current</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Assignment</h2>
            {assignedAgent && (
              <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  {assignedAgent.firstName[0]}{assignedAgent.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {assignedAgent.firstName} {assignedAgent.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{assignedAgent.email}</p>
                </div>
              </div>
            )}
            <LeadAssign
              leadId={lead.id}
              currentAssignedTo={lead.assignedTo}
              agents={users}
            />
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Quick Contact</h2>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Send Email
              </a>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Call Customer
                </a>
              )}
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg border bg-emerald-50 border-emerald-200 px-3 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                  aria-label={`WhatsApp ${lead.name}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
