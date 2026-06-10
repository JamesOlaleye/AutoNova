import type { MetadataRoute } from 'next';
import { getVehicles } from '@/lib/api/vehicles';
import { vehicleSlug } from '@/lib/utils';

export const revalidate = 86400; // 24 hours

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3100';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: 'daily' },
    { url: `${BASE}/vehicles`, priority: 0.9, changeFrequency: 'hourly' },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/financing`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/trade-in`, priority: 0.5, changeFrequency: 'monthly' },
  ];

  try {
    const { data: vehicles } = await getVehicles({ limit: 1000 });
    const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
      url: `${BASE}/vehicles/${vehicleSlug(v)}`,
      lastModified: new Date(v.updatedAt),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    }));
    return [...staticRoutes, ...vehicleRoutes];
  } catch {
    return staticRoutes;
  }
}
