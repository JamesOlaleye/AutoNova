import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft, Car, DollarSign,
  Clock, CheckCircle2, XCircle, UserIcon,
} from 'lucide-react';
import { getSession } from '@/lib/session';
import { getOrder } from '@/lib/api/orders';
import { getVehicle } from '@/lib/api/vehicles';
import { getUsers } from '@/lib/api/users';
import { Badge } from '@/components/ui/badge';
import { OrderStatusUpdate } from './_components/order-status-update';
import { OrderNotes } from './_components/order-notes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_CONFIG, ORDER_TYPE_LABEL } from '@/constants/order.constants';
import type { OrderStatus, Vehicle, User as DashboardUser } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Order Detail' };
}

const PIPELINE: OrderStatus[] = ['PENDING', 'NEGOTIATING', 'FINANCED', 'COMPLETED'];

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const order = await getOrder(id, session!.token, session!.tenantId).catch(() => null);
  if (!order) notFound();

  const [vehicle, usersResult] = await Promise.all([
    getVehicle(order.vehicleId, session!.token, session!.tenantId).catch(() => null),
    getUsers(session!.token, session!.tenantId).catch(() => ({ data: [] as DashboardUser[] })),
  ]);

  const agent = usersResult.data.find((u) => u.id === order.salesAgentId);
  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
  const isClosed = ['COMPLETED', 'CANCELLED'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Orders
        </Link>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ORDER_TYPE_LABEL[order.type]} · Created {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusConfig.variant} className="gap-1.5 text-sm">
            <span className={cn('h-2 w-2 rounded-full', statusConfig.dot)} aria-hidden="true" />
            {statusConfig.label}
          </Badge>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(order.salePrice, order.currency)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — details */}
        <div className="space-y-5 lg:col-span-2">

          {/* Vehicle */}
          {vehicle && (
            <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="vehicle-heading">
              <div className="mb-3 flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 id="vehicle-heading" className="text-sm font-semibold text-foreground">Vehicle</h2>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Car className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.color} · {vehicle.condition} · {vehicle.fuelType}
                  </p>
                </div>
                <Link href={`/inventory/${vehicle.id}`} className="shrink-0 text-xs font-medium text-primary hover:underline">
                  View
                </Link>
              </div>
            </section>
          )}

          {/* Financial details */}
          <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="financials-heading">
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 id="financials-heading" className="text-sm font-semibold text-foreground">Financial Details</h2>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Sale Price', value: formatCurrency(order.salePrice, order.currency) },
                { label: 'Currency', value: order.currency },
                ...(order.downPayment != null ? [{ label: 'Down Payment', value: formatCurrency(order.downPayment, order.currency) }] : []),
                ...(order.financingTerm != null ? [{ label: 'Financing Term', value: `${order.financingTerm} months` }] : []),
                { label: 'Order Type', value: ORDER_TYPE_LABEL[order.type] },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 px-4 py-3">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-semibold text-foreground text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Timestamps */}
          {(order.closedAt || order.leadId) && (
            <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="timeline-heading">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 id="timeline-heading" className="text-sm font-semibold text-foreground">Timeline</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.closedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {order.status === 'COMPLETED'
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                        : <XCircle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />}
                      {order.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                    </span>
                    <span className="font-medium">{formatDate(order.closedAt)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <OrderNotes orderId={order.id} initialNotes={order.notes} />
          </section>
        </div>

        {/* Right — sidebar */}
        <aside className="space-y-5">
          {/* Status */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Pipeline Status</h2>
            <OrderStatusUpdate order={order} />

            <div className="mt-4 space-y-1.5">
              {PIPELINE.map((s, i) => {
                const cfg = ORDER_STATUS_CONFIG[s];
                const statuses = PIPELINE;
                const currentIndex = statuses.indexOf(order.status as OrderStatus);
                const isActive = s === order.status;
                const isPast = i < currentIndex && order.status !== 'CANCELLED';
                return (
                  <div key={s} className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs',
                    isActive ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground',
                  )}>
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', isActive || isPast ? cfg.dot : 'bg-muted-foreground/20')} aria-hidden="true" />
                    {cfg.label}
                    {isActive && <span className="ml-auto text-[10px] font-medium text-primary">Current</span>}
                  </div>
                );
              })}
              {order.status === 'CANCELLED' && (
                <div className="flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                  Cancelled
                  <span className="ml-auto text-[10px] font-medium text-primary">Current</span>
                </div>
              )}
            </div>
          </div>

          {/* Sales agent */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">Sales Agent</h2>
            </div>
            {agent ? (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                  {agent.firstName[0]}{agent.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {agent.firstName} {agent.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{agent.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No agent assigned</p>
            )}
          </div>

          {/* IDs for reference */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Reference</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-medium text-foreground truncate">...{order.id.slice(-12)}</span>
              </div>
              {order.leadId && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Enquiry ID</span>
                  <Link href={`/leads/${order.leadId}`} className="font-mono font-medium text-primary hover:underline truncate">
                    ...{order.leadId.slice(-12)}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
