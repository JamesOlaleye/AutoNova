import { getAdminSession } from '@/lib/session';
import { getAllTenants, type AdminTenant } from '@/lib/api/tenants';

const PLAN_BADGE: Record<string, string> = {
  STARTER: 'bg-gray-100 text-gray-700',
  GROWTH: 'bg-blue-100 text-blue-700',
  PRO: 'bg-indigo-100 text-indigo-700',
};

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[plan] ?? 'bg-gray-100 text-gray-700'}`}>
      {plan}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default async function TenantsPage() {
  const session = await getAdminSession();
  if (!session) return null;

  let tenants: AdminTenant[] = [];
  let error: string | null = null;

  try {
    const result = await getAllTenants(session.token, session.tenantId);
    tenants = Array.isArray(result) ? result : (result as any).data ?? [];
  } catch (err: any) {
    error = err?.message ?? 'Failed to load tenants';
  }

  const activeTenants = tenants.filter(t => t.isActive).length;
  const planCounts = tenants.reduce<Record<string, number>>((acc, t) => {
    acc[t.plan] = (acc[t.plan] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tenants</h1>
        <p className="mt-0.5 text-sm text-gray-500">All dealer accounts on the platform</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={tenants.length} />
        <StatCard label="Active" value={activeTenants} color="text-green-600" />
        {Object.entries(planCounts).map(([plan, count]) => (
          <StatCard key={plan} label={plan} value={count} />
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : tenants.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No tenants found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Dealer', 'Slug', 'Plan', 'Country', 'Status', 'Created'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{tenant.name}</div>
                    <div className="text-xs text-gray-500">{tenant.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{tenant.slug}</td>
                  <td className="px-4 py-3"><PlanBadge plan={tenant.plan} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tenant.country}</td>
                  <td className="px-4 py-3"><StatusDot active={tenant.isActive} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
