import { apiRequest } from '../api';
import type { Vehicle, VehicleFilters, PaginatedResult } from '@/types';

export async function getVehicles(
  filters: VehicleFilters = {},
): Promise<PaginatedResult<Vehicle>> {
  const params = new URLSearchParams();
  // Only show available vehicles on the storefront
  params.set('status', 'AVAILABLE');
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && k !== 'status') params.set(k, String(v));
  });
  return apiRequest<PaginatedResult<Vehicle>>(`/vehicles?${params}`, {
    revalidate: 60,
  });
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/vehicles/${id}`, { revalidate: 60 });
}
