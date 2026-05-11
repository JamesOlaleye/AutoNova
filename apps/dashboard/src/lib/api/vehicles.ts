import { apiRequest } from '../api';
import type { Vehicle, CreateVehicleInput, UpdateVehicleInput, PaginatedResult } from '@/types';

export interface VehicleFilters {
  page?: number;
  limit?: number;
  make?: string;
  model?: string;
  status?: string;
  condition?: string;
}

export async function getVehicles(
  token: string,
  tenantId: string,
  filters: VehicleFilters = {},
): Promise<PaginatedResult<Vehicle>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PaginatedResult<Vehicle>>(`/vehicles${query}`, {
    token,
    tenantId,
    cache: 'no-store',
  });
}

export async function getVehicle(
  id: string,
  token: string,
  tenantId: string,
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/vehicles/${id}`, { token, tenantId });
}

export async function createVehicle(
  data: CreateVehicleInput,
  token: string,
  tenantId: string,
): Promise<Vehicle> {
  return apiRequest<Vehicle>('/vehicles', {
    method: 'POST',
    body: data,
    token,
    tenantId,
  });
}

export async function updateVehicle(
  id: string,
  data: UpdateVehicleInput,
  token: string,
  tenantId: string,
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/vehicles/${id}`, {
    method: 'PATCH',
    body: data,
    token,
    tenantId,
  });
}

export async function deleteVehicle(
  id: string,
  token: string,
  tenantId: string,
): Promise<void> {
  return apiRequest<void>(`/vehicles/${id}`, {
    method: 'DELETE',
    token,
    tenantId,
  });
}

export async function uploadVehicleImage(
  id: string,
  base64: string,
  token: string,
  tenantId: string,
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/vehicles/${id}/images`, {
    method: 'POST',
    body: { base64 },
    token,
    tenantId,
  });
}

export async function deleteVehicleImage(
  id: string,
  publicId: string,
  url: string,
  token: string,
  tenantId: string,
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/vehicles/${id}/images`, {
    method: 'DELETE',
    body: { publicId, url },
    token,
    tenantId,
  });
}
