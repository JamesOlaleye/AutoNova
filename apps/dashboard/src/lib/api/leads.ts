import { apiRequest } from '../api';
import type { Lead, UpdateLeadInput, PaginatedResult } from '@/types';

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export async function getLeads(
  token: string,
  tenantId: string,
  filters: LeadFilters = {},
): Promise<PaginatedResult<Lead>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PaginatedResult<Lead>>(`/leads${query}`, {
    token,
    tenantId,
    cache: 'no-store',
  });
}

export async function getLead(
  id: string,
  token: string,
  tenantId: string,
): Promise<Lead> {
  return apiRequest<Lead>(`/leads/${id}`, { token, tenantId });
}

export async function updateLead(
  id: string,
  data: UpdateLeadInput,
  token: string,
  tenantId: string,
): Promise<Lead> {
  return apiRequest<Lead>(`/leads/${id}`, {
    method: 'PATCH',
    body: data,
    token,
    tenantId,
  });
}
