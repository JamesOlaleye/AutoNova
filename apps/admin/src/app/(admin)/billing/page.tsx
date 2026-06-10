import { getAdminSession } from '@/lib/session';
import { getAllTenants, type AdminTenant } from '@/lib/api/tenants';

const PLAN_PRICE: Record<string, number> = {
  STARTER: 49,
  GROWTH: 149,
  PRO: 349,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default async function BillingPage() {
  const session = await getAdminSession();
  if (!session) return null;

  let tenants: AdminTenant[] = [];
  let error: string | null = null;

  try {
    const result = await getAllTenants(session.token, session.tenantId);
    tenants = Array.isArray(result) ? result : (result as any).data ?? [];
  } catch (err: any) {
    error = err?.message ?? 'Failed to load billing data';
  }

  const active = tenants.filter(t => t.isActive);
  const mrr = active.reduce((sum, t) => sum + (PLAN_PRICE[t.plan] ?? 0), 0);
  const arr = mrr * 12;

  const planGroups = active.reduce<Record<string, AdminTenant[]>>((acc, t) => {
    acc[t.plan] = [...(acc[t.plan] ?? []), t];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Billing Overview</h1>
        <p className="mt-0.5 text-sm text-gray-500">Estimated recurring revenue based on active tenant plans</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard label="Estimated MRR" value={formatCurrency(mrr)} sub="per month" />
            <MetricCard label="Estimated ARR" value={formatCurrency(arr)} sub="per year" />
            <MetricCard label="Active Dealers" value={String(active.length)} sub={`of ${tenants.length} total`} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Plan Breakdown</h2>
            <div className="space-y-4">
              {(['STARTER', 'GROWTH', 'PRO'] as const).map(plan => {
                const group = planGroups[plan] ?? [];
                const revenue = group.length * PLAN_PRICE[plan];
                const pct = active.length > 0 ? Math.round((group.length / active.length) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{plan}</span>
                        <span className="text-xs text-gray-500">{formatCurrency(PLAN_PRICE[plan])}/mo × {group.length}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(revenue)}/mo</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{group.length} dealer{group.length !== 1 ? 's' : ''} ({pct}%)</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Active Dealers</h2>
            </div>
            {active.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No active dealers</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Dealer', 'Plan', 'Revenue/mo', 'Country', 'Since'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {active.map(tenant => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-xs text-gray-500">{tenant.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{tenant.plan}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(PLAN_PRICE[tenant.plan] ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tenant.country}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{sub}</p>
    </div>
  );
}
