import type { DealerProfile } from '@/types';
import { apiRequest } from '../api';

export async function getPublicTenant(slug: string): Promise<DealerProfile | null> {
  try {
    return await apiRequest<DealerProfile>(`/tenants/public/${slug}`, { revalidate: 300 });
  } catch {
    return null;
  }
}
