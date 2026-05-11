import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, ShoppingCart } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getOrders } from '@/lib/api/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_CONFIG, ORDER_TYPE_LABEL } from '@/constants/order.constants';
import type { Order, OrderStatus } from '@/types';

export const metadata: Metadata = { title: 'Orders' };

export default async function OrdersPage() {
  const session = await getSession();
  const { data: orders, total } = await getOrders(session!.token, session!.tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${total} deal${total !== 1 ? 's' : ''} in your pipeline`}
        actions={
          <Button asChild className="gap-2">
            <Link href="/orders/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Order
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Create an order when a customer commits to purchasing or financing a vehicle."
            action={
              <Button asChild className="gap-2">
                <Link href="/orders/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create first order
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="divide-y">
            <div className="bg-muted/40 px-5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {total} {total === 1 ? 'Order' : 'Orders'}
              </p>
            </div>
            {orders.map((order: Order) => {
              const config = ORDER_STATUS_CONFIG[order.status as OrderStatus];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <Badge variant={config.variant} className="gap-1 text-[11px]">
                        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {ORDER_TYPE_LABEL[order.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(order.createdAt)}
                      {order.closedAt && ` · Closed ${formatDate(order.closedAt)}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-foreground">
                      {formatCurrency(order.salePrice, order.currency)}
                    </p>
                    {order.downPayment && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(order.downPayment, order.currency)} down
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
