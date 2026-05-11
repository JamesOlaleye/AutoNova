import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getVehicle } from '@/lib/api/vehicles';
import { EditVehicleForm } from '../_components/edit-vehicle-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Edit Vehicle' };
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const vehicle = await getVehicle(id, session!.token, session!.tenantId).catch(() => null);
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/inventory/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to vehicle
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit — {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update vehicle details. Status is changed from the vehicle detail page.
        </p>
      </div>
      <EditVehicleForm vehicle={vehicle} />
    </div>
  );
}
