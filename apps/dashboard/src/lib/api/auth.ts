import { apiRequest } from '../api';
import type { AuthResponse, AuthTokens } from '@autonova/types';

export async function loginApi(
  email: string,
  password: string,
  tenantId: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    tenantId,
  });
}

export async function refreshTokenApi(
  refreshToken: string,
  tenantId: string,
): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    tenantId,
  });
}

export async function logoutApi(token: string, tenantId: string): Promise<void> {
  return apiRequest('/auth/logout', {
    method: 'POST',
    token,
    tenantId,
  });
}
