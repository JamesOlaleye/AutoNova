'use server';

import { redirect } from 'next/navigation';
import { loginApi, logoutApi, registerStaffApi } from '@/lib/api/auth';
import { createVehicle, updateVehicle, uploadVehicleImage, deleteVehicleImage } from '@/lib/api/vehicles';
import { updateLead } from '@/lib/api/leads';
import { createOrder, updateOrder, uploadOrderDocument, deleteOrderDocument } from '@/lib/api/orders';
import { updateUser, deleteUser, changePassword } from '@/lib/api/users';
import { setSession, getSession, clearSession } from '@/lib/session';
import { ApiError } from '@/lib/api';
import { createVehicleSchema } from '@/lib/schemas/vehicle.schema';
import { createOrderSchema } from '@/lib/schemas/order.schema';
import type { LeadStatus, CreateVehicleInput, CreateOrderInput, OrderStatus } from '@/types';

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

  let vehicleId: string;
  try {
    const vehicle = await createVehicle(parsed.data as CreateVehicleInput, session.token, session.tenantId);
    vehicleId = vehicle.id;
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to create vehicle. Please try again.' };
  }

  redirect(`/inventory/${vehicleId}`);
}

export async function updateVehicleAction(
  id: string,
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
    await updateVehicle(id, parsed.data as CreateVehicleInput, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to update vehicle. Please try again.' };
  }

  redirect(`/inventory/${id}`);
}

export async function updateVehicleStatusAction(
  id: string,
  status: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateVehicle(id, { status: status as import('@/types').VehicleStatus }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to update vehicle status.' };
  }

  return {};
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

export async function scheduleTestDriveAction(
  id: string,
  scheduledAt: string | null,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateLead(id, { scheduledAt }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to schedule test drive.' };
  }

  return {};
}

export async function assignLeadAction(
  id: string,
  assignedTo: string | null,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateLead(id, { assignedTo: assignedTo ?? undefined }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to assign lead.' };
  }

  return {};
}

export async function updateLeadNotesAction(
  id: string,
  notes: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateLead(id, { notes }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to save notes.' };
  }

  return {};
}

// ─── Vehicle Images ───────────────────────────────────────────────────────────

export async function uploadVehicleImageAction(
  vehicleId: string,
  base64: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await uploadVehicleImage(vehicleId, base64, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to upload image. Please try again.' };
  }

  return {};
}

export async function deleteVehicleImageAction(
  vehicleId: string,
  publicId: string,
  url: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await deleteVehicleImage(vehicleId, publicId, url, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to delete image.' };
  }

  return {};
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrderAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const raw = Object.fromEntries(formData.entries());
  // Strip empty optional UUID fields so Zod doesn't reject empty strings as UUIDs
  if (!raw.leadId) delete raw.leadId;
  if (!raw.salesAgentId) delete raw.salesAgentId;
  if (!raw.downPayment) delete raw.downPayment;
  if (!raw.financingTerm) delete raw.financingTerm;

  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  let orderId: string;
  try {
    const order = await createOrder(parsed.data as CreateOrderInput, session.token, session.tenantId);
    orderId = order.id;
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to create order. Please try again.' };
  }

  redirect(`/orders/${orderId}`);
}

export async function updateOrderStatusAction(
  id: string,
  status: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateOrder(id, { status: status as OrderStatus }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to update order status.' };
  }

  return {};
}

export async function updateOrderNotesAction(
  id: string,
  notes: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateOrder(id, { notes }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to save notes.' };
  }

  return {};
}

// ─── Order Documents ─────────────────────────────────────────────────────────

export async function uploadOrderDocumentAction(
  orderId: string,
  base64: string,
  name: string,
  docType: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await uploadOrderDocument(orderId, base64, name, docType, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to upload document. Please try again.' };
  }

  return {};
}

export async function deleteOrderDocumentAction(
  orderId: string,
  publicId: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await deleteOrderDocument(orderId, publicId, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to remove document.' };
  }

  return {};
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export async function inviteStaffAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !firstName || !lastName || !role) {
    return { error: 'All required fields must be filled.' };
  }

  try {
    await registerStaffApi(
      { email, password, firstName, lastName, phone: phone || undefined, role },
      session.token,
      session.tenantId,
    );
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to invite staff member.' };
  }

  redirect('/staff');
}

export async function updateStaffRoleAction(
  id: string,
  role: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateUser(id, { role }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to update role.' };
  }

  return {};
}

export async function toggleStaffStatusAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await updateUser(id, { isActive }, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to update staff status.' };
  }

  return {};
}

export async function removeStaffAction(
  id: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    await deleteUser(id, session.token, session.tenantId);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to remove staff member.' };
  }

  return {};
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) return { error: 'All fields are required' };
  if (newPassword.length < 8) return { error: 'New password must be at least 8 characters' };
  if (newPassword !== confirmPassword) return { error: 'Passwords do not match' };

  try {
    await changePassword(currentPassword, newPassword, session.token, session.tenantId);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Failed to change password. Please try again.' };
  }
}
