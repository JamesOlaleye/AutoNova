import { apiRequest } from '../api';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string; tenantId: string };
}

export async function loginApi(
  email: string,
  password: string,
  tenantId: string,
): Promise<LoginResult> {
  return apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: { email, password },
    tenantId,
  });
}

export async function logoutApi(token: string, tenantId: string): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST', token, tenantId });
}
