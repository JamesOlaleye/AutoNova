'use server';

import { cookies } from 'next/headers';

export interface AdminSession {
  token: string;
  tenantId: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string };
}

const OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8,
};

export async function setAdminSession(session: AdminSession): Promise<void> {
  const c = await cookies();
  c.set('admin_token', session.token, OPTS);
  c.set('admin_tenant_id', session.tenantId, OPTS);
  c.set('admin_user', JSON.stringify(session.user), OPTS);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const c = await cookies();
  const token = c.get('admin_token')?.value;
  const tenantId = c.get('admin_tenant_id')?.value;
  const userStr = c.get('admin_user')?.value;
  if (!token || !tenantId || !userStr) return null;
  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'PLATFORM_ADMIN') return null;
    return { token, tenantId, user };
  } catch { return null; }
}

export async function clearAdminSession(): Promise<void> {
  const c = await cookies();
  c.delete('admin_token');
  c.delete('admin_tenant_id');
  c.delete('admin_user');
}
