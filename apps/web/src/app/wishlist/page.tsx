import type { Metadata } from 'next';
import { WishlistGrid } from './_components/wishlist-grid';

export const metadata: Metadata = {
  title: 'Saved Vehicles',
  description: 'Your saved vehicles — review and compare your shortlist.',
};

export default function WishlistPage() {
  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved Vehicles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vehicles you have saved for later — tap the heart icon to save or remove.
        </p>
      </div>
      <WishlistGrid />
    </div>
  );
}
