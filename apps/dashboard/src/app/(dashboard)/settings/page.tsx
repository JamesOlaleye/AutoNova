import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ChevronRight, CreditCard, Zap, CheckCircle2 } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getTenant } from '@/lib/api/tenants';
import { getVehicles } from '@/lib/api/vehicles';
import { getUsers } from '@/lib/api/users';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Settings' };

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  GROWTH: 'Growth',
  PRO: 'Pro',
};

const PLAN_LIMITS: Record<string, { listings: number; staff: number }> = {
  STARTER: { listings: 30, staff: 2 },
  GROWTH: { listings: 200, staff: 10 },
  PRO: { listings: -1, staff: -1 },
};

const PLAN_BADGE: Record<string, 'secondary' | 'info' | 'success'> = {
  STARTER: 'secondary',
  GROWTH: 'info',
  PRO: 'success',
};

const UPGRADE_PLANS = [
  {
    key: 'GROWTH',
    name: 'Growth',
    price: '$149',
    features: ['200 vehicle listings', '10 staff accounts', 'Analytics dashboard', 'Priority support'],
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '$349',
    features: ['Unlimited listings', 'Unlimited staff', 'API access', 'Custom domain', 'Dedicated support'],
  },
];

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const danger = !unlimited && pct >= 90;
  const warning = !unlimited && pct >= 70 && pct < 90;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn('text-muted-foreground', danger && 'text-destructive font-semibold')}>
          {unlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              danger ? 'bg-destructive' : warning ? 'bg-amber-500' : 'bg-primary',
            )}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-label={`${label}: ${used} of ${limit} used`}
          />
        </div>
      )}
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const [tenant, vehiclesResult, usersResult] = await Promise.all([
    getTenant(session.tenantId, session.token).catch(() => null),
    getVehicles(session.token, session.tenantId, { limit: 1 }).catch(() => ({ total: 0 })),
    getUsers(session.token, session.tenantId).catch(() => ({ data: [] as any[] })),
  ]);

  const plan = tenant?.plan ?? 'STARTER';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.STARTER;
  const vehicleCount = (vehiclesResult as any).total ?? 0;
  const staffCount = (usersResult.data ?? []).filter((u: any) =>
    ['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER'].includes(u.role),
  ).length;

  const showUpgrade = plan !== 'PRO';
  const upgradePlans = UPGRADE_PLANS.filter((p) =>
    plan === 'STARTER' ? true : p.key === 'PRO',
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Account settings */}
      <div>
        <h1 className="mb-4 text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <div className="divide-y rounded-xl border bg-card shadow-sm">
          <Link
            href="/settings/password"
            className="flex min-h-[64px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Plan & usage */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Plan &amp; Usage</h2>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-lg font-bold text-foreground">{PLAN_LABELS[plan] ?? plan}</p>
                <Badge variant={PLAN_BADGE[plan] ?? 'secondary'}>{PLAN_LABELS[plan] ?? plan}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <UsageBar used={vehicleCount} limit={limits.listings} label="Vehicle Listings" />
            <UsageBar used={staffCount} limit={limits.staff} label="Staff Accounts" />
          </div>
        </div>
      </div>

      {/* Upgrade section */}
      {showUpgrade && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Upgrade Your Plan</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {upgradePlans.map((p) => (
              <div
                key={p.key}
                className={cn(
                  'rounded-xl border p-5 shadow-sm',
                  p.key === 'PRO' && 'border-primary/40 bg-primary/5',
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-2xl font-bold text-foreground">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                  {p.key === 'PRO' && (
                    <Badge variant="success" className="text-xs">Best Value</Badge>
                  )}
                </div>
                <ul className="mb-4 space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:support@autonova.io?subject=Upgrade to ${p.name}&body=Hi, I'd like to upgrade my AutoNova plan to ${p.name}.`}
                  className="block w-full rounded-lg border border-primary bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Upgrade to {p.name}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground text-center">
            Contact <a href="mailto:support@autonova.io" className="text-primary hover:underline">support@autonova.io</a> to upgrade your plan.
          </p>
        </div>
      )}
    </div>
  );
}
