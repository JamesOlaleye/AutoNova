'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/common/vehicle-card';
import { useWishlistStore } from '@/store/wishlist.store';
import type { Vehicle } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export function WishlistGrid() {
  const { ids, clear } = useWishlistStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.allSettled(
      ids.map((id) =>
        fetch(`${API}/vehicles/${id}`, { headers: { 'X-Tenant-ID': TENANT_ID } }).then((r) =>
          r.ok ? r.json() : null,
        ),
      ),
    ).then((results) => {
      setVehicles(
        results
          .filter((r): r is PromiseFulfilledResult<Vehicle> => r.status === 'fulfilled' && r.value != null)
          .map((r) => r.value),
      );
      setLoading(false);
    });
  }, [ids]);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(ids.length || 2)].map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (ids.length === 0 || vehicles.length === 0) {
    return (
      <div className="py-16 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">No saved vehicles</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart icon on any vehicle to save it for later.
        </p>
        <Button asChild className="mt-6">
          <Link href="/vehicles">Browse Inventory</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{vehicles.length} saved vehicle{vehicles.length > 1 ? 's' : ''}</p>
        <button onClick={clear} className="text-xs text-destructive hover:underline">Clear all</button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
    </>
  );
}
