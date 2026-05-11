import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getVehicles } from '@/lib/api/vehicles';
import { getUsers } from '@/lib/api/users';
import { CreateOrderForm } from './_components/create-order-form';

export const metadata: Metadata = { title: 'New Order' };

export default async function NewOrderPage() {
  const session = await getSession();

  const [vehiclesResult, usersResult] = await Promise.all([
    getVehicles(session!.token, session!.tenantId, { limit: 100, status: 'AVAILABLE' }),
    getUsers(session!.token, session!.tenantId),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to orders
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a deal record when a customer commits to a vehicle
        </p>
      </div>
      <CreateOrderForm
        vehicles={vehiclesResult.data}
        agents={usersResult.data}
      />
    </div>
  );
}
