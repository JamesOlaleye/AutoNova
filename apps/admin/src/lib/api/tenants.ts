import { apiRequest } from '../api';

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  country: string;
  currency: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAllTenants(token: string, tenantId: string): Promise<AdminTenant[]> {
  return apiRequest<AdminTenant[]>('/tenants', { token, tenantId });
}

export async function getTenant(id: string, token: string, tenantId: string): Promise<AdminTenant> {
  return apiRequest<AdminTenant>(`/tenants/${id}`, { token, tenantId });
}
