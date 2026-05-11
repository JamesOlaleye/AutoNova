import type { Metadata } from 'next';
import Link from 'next/link';
import { Car, Users, AlertCircle, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getVehicles } from '@/lib/api/vehicles';
import { getLeads } from '@/lib/api/leads';
import { StatsCard } from '@/components/common/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Vehicle, Lead, VehicleStatus, LeadStatus } from '@/types';
import { LEAD_TYPES } from '@/constants/lead.constants';

export const metadata: Metadata = { title: 'Dashboard' };

const VEHICLE_STATUS_VARIANT: Record<VehicleStatus, 'success' | 'warning' | 'secondary' | 'info'> = {
  AVAILABLE: 'success',
  RESERVED:  'warning',
  SOLD:      'secondary',
  DRAFT:     'info',
};

const LEAD_STATUS_VARIANT: Record<LeadStatus, 'info' | 'warning' | 'success' | 'destructive' | 'secondary'> = {
  NEW:       'info',
  CONTACTED: 'warning',
  QUALIFIED: 'success',
  LOST:      'destructive',
  CONVERTED: 'secondary',
};

const TYPE_LABEL = Object.fromEntries(LEAD_TYPES.map((t) => [t.value, t.label]));

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const session = await getSession();

  const [vehiclesResult, leadsResult, availableResult, newLeadsResult] = await Promise.all([
    getVehicles(session!.token, session!.tenantId, { limit: 5 }),
    getLeads(session!.token, session!.tenantId, { limit: 5 }),
    getVehicles(session!.token, session!.tenantId, { limit: 1, status: 'AVAILABLE' }),
    getLeads(session!.token, session!.tenantId, { limit: 1, status: 'NEW' }),
  ]);

  const recentVehicles: Vehicle[] = vehiclesResult.data;
  const recentLeads: Lead[] = leadsResult.data;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {session!.user.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your dealership today.
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Listings"  value={vehiclesResult.total}  icon={Car}          variant="blue"   />
        <StatsCard title="Available Now"   value={availableResult.total} icon={CheckCircle2} variant="green"  />
        <StatsCard title="Total Leads"     value={leadsResult.total}     icon={Users}        variant="violet" />
        <StatsCard title="New Leads"       value={newLeadsResult.total}  icon={AlertCircle}  variant="amber"  />
      </div>

      {/* Recent activity panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent inventory */}
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Recent Inventory</p>
              <p className="text-xs text-muted-foreground">Latest vehicles added</p>
            </div>
            <Link href="/inventory" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentVehicles.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <Car className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No vehicles yet</p>
              <Button asChild size="sm" className="mt-4 gap-1.5">
                <Link href="/inventory/new"><Plus className="h-3.5 w-3.5" />Add first vehicle</Link>
              </Button>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y">
                {recentVehicles.map((v: Vehicle) => (
                  <li key={v.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Car className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {v.year} {v.make} {v.model}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(v.price, v.currency)}</p>
                    </div>
                    <Badge variant={VEHICLE_STATUS_VARIANT[v.status] ?? 'secondary'}>{v.status}</Badge>
                  </li>
                ))}
              </ul>
              <div className="border-t px-5 py-3">
                <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs">
                  <Link href="/inventory/new"><Plus className="h-3.5 w-3.5" />Add vehicle</Link>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Recent leads */}
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Recent Enquiries</p>
              <p className="text-xs text-muted-foreground">Latest interested buyers</p>
            </div>
            <Link href="/leads" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No leads yet</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[180px]">
                Leads appear when customers submit enquiries on your storefront.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y">
              {recentLeads.map((lead: Lead) => (
                <li key={lead.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {lead.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {TYPE_LABEL[lead.type] ?? lead.type} · {formatDate(lead.createdAt)}
                    </p>
                  </div>
                  <Badge variant={LEAD_STATUS_VARIANT[lead.status] ?? 'secondary'}>{lead.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
