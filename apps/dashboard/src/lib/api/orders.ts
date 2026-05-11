import { apiRequest } from '../api';
import type { Order, CreateOrderInput, UpdateOrderInput, PaginatedResult } from '@/types';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export async function getOrders(
  token: string,
  tenantId: string,
  filters: OrderFilters = {},
): Promise<PaginatedResult<Order>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PaginatedResult<Order>>(`/orders${query}`, {
    token,
    tenantId,
    cache: 'no-store',
  });
}

export async function getOrder(
  id: string,
  token: string,
  tenantId: string,
): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`, { token, tenantId });
}

export async function createOrder(
  data: CreateOrderInput,
  token: string,
  tenantId: string,
): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: data,
    token,
    tenantId,
  });
}

export async function updateOrder(
  id: string,
  data: UpdateOrderInput,
  token: string,
  tenantId: string,
): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`, {
    method: 'PATCH',
    body: data,
    token,
    tenantId,
  });
}
