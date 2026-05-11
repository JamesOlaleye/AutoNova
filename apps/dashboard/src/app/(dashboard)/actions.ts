'use server';

import { redirect } from 'next/navigation';
import { loginApi, logoutApi } from '@/lib/api/auth';
import { createVehicle } from '@/lib/api/vehicles';
import { updateLead } from '@/lib/api/leads';
import { setSession, getSession, clearSession } from '@/lib/session';
import { ApiError } from '@/lib/api';
import { createVehicleSchema } from '@/lib/schemas/vehicle.schema';
import type { LeadStatus, CreateVehicleInput } from '@/types';

const DEV_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rawRedirect = formData.get('redirectTo') as string | null;

  // Guard against open-redirect: only allow relative internal paths
  const redirectTo =
    rawRedirect?.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard';

  if (!email || !password) return { error: 'Email and password are required' };

  try {
    const result = await loginApi(email, password, DEV_TENANT_ID);
    await setSession({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      tenantId: DEV_TENANT_ID,
      user: result.user,
    });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Login failed. Please try again.' };
  }

  redirect(redirectTo);
}

export async function logout(): Promise<void> {
  const session = await getSession();
  if (session) {
    try {
      await logoutApi(session.token, session.tenantId);
    } catch {
      // Clear session regardless of API response
    }
  }
  await clearSession();
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export async function createVehicleAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createVehicleSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: `${firstError.path[0]}: ${firstError.message}` };
  }

  try {
    await createVehicle(parsed.data as CreateVehicleInput, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to create vehicle. Please try again.' };
  }

  redirect('/inventory');
}

export async function updateLeadStatusAction(
  id: string,
  status: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateLead(id, { status: status as LeadStatus }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to update lead.' };
  }

  return {};
}
