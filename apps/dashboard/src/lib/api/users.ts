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

export async function updateUser(
  id: string,
  data: { role?: string; isActive?: boolean },
  token: string,
  tenantId: string,
): Promise<User> {
  return apiRequest<User>(`/users/${id}`, {
    method: 'PATCH',
    body: data,
    token,
    tenantId,
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  token: string,
  tenantId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/users/me/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
    token,
    tenantId,
  });
}

export async function deleteUser(
  id: string,
  token: string,
  tenantId: string,
): Promise<void> {
  return apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
    token,
    tenantId,
  });
}
