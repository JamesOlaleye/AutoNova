'use server';

import { redirect } from 'next/navigation';
import { loginApi, logoutApi } from '@/lib/api/auth';
import { setAdminSession, getAdminSession, clearAdminSession } from '@/lib/session';
import { ApiError } from '@/lib/api';

const DEV_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export async function adminLogin(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!email || !password) return { error: 'Email and password are required' };

  try {
    const result = await loginApi(email, password, DEV_TENANT_ID);
    if (result.user.role !== 'PLATFORM_ADMIN') {
      return { error: 'Access denied. PLATFORM_ADMIN role required.' };
    }
    await setAdminSession({
      token: result.accessToken,
      tenantId: result.user.tenantId ?? DEV_TENANT_ID,
      user: result.user,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Login failed. Please try again.' };
  }

  redirect('/tenants');
}

export async function adminLogout(): Promise<void> {
  const session = await getAdminSession();
  if (session) {
    try { await logoutApi(session.token, session.tenantId); } catch { /* ignore */ }
  }
  await clearAdminSession();
  redirect('/login');
}
