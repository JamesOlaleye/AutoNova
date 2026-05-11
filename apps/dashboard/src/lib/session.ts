'use server';

import { cookies } from 'next/headers';

export interface Session {
  token: string;
  refreshToken: string;
  tenantId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('access_token', session.token, { ...COOKIE_OPTS, maxAge: 60 * 15 });
  cookieStore.set('refresh_token', session.refreshToken, COOKIE_OPTS);
  cookieStore.set('tenant_id', session.tenantId, COOKIE_OPTS);
  cookieStore.set('session_user', JSON.stringify(session.user), COOKIE_OPTS);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const tenantId = cookieStore.get('tenant_id')?.value;
  const userStr = cookieStore.get('session_user')?.value;

  if (!token || !refreshToken || !tenantId || !userStr) return null;

  try {
    return { token, refreshToken, tenantId, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('tenant_id');
  cookieStore.delete('session_user');
}
