import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AddVehicleForm } from './_components/add-vehicle-form';

export const metadata: Metadata = { title: 'Add Vehicle' };

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/inventory"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to inventory
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add Vehicle</h1>
        <p className="mt-1 text-sm text-muted-foreground">List a new vehicle in your catalogue</p>
      </div>
      <AddVehicleForm />
    </div>
  );
}
