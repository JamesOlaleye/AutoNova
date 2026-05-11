import { apiRequest } from '../api';
import type { User, PaginatedResult } from '@/types';

export async function getUsers(
  token: string,
  tenantId: string,
): Promise<PaginatedResult<User>> {
  return apiRequest<PaginatedResult<User>>('/users?limit=100', {
    token,
    tenantId,
    cache: 'no-store',
  });
}

export async function getUser(
  id: string,
  token: string,
  tenantId: string,
): Promise<User> {
  return apiRequest<User>(`/users/${id}`, { token, tenantId });
}
