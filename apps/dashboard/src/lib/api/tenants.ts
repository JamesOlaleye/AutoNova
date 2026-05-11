import { apiRequest } from '../api';

export interface TenantDetails {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  plan: string;
  email: string;
  phone?: string;
}

export async function getTenant(id: string, token: string): Promise<TenantDetails> {
  return apiRequest<TenantDetails>(`/tenants/${id}`, { token, tenantId: id });
}
