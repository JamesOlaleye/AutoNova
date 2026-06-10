import { apiRequest } from '@/lib/api';

export interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED';
  gateway: 'STRIPE' | 'PAYSTACK';
  currentPeriodEnd: string;
  checkoutUrl?: string;
}

export async function getSubscription(token: string, tenantId: string): Promise<Subscription | null> {
  try {
    return await apiRequest<Subscription>('/payments/subscription', { token, tenantId });
  } catch {
    return null;
  }
}

export async function createSubscription(
  token: string,
  tenantId: string,
  plan: string,
  email: string,
  gateway: 'STRIPE' | 'PAYSTACK',
): Promise<Subscription> {
  return apiRequest<Subscription>('/payments/subscribe', {
    method: 'POST',
    token,
    tenantId,
    body: { plan, email, gateway },
  });
}

export async function createPortalSession(
  token: string,
  tenantId: string,
): Promise<{ url: string } | null> {
  return apiRequest<{ url: string } | null>('/payments/portal', {
    method: 'POST',
    token,
    tenantId,
  });
}

export async function cancelSubscription(
  token: string,
  tenantId: string,
  gateway: 'STRIPE' | 'PAYSTACK',
): Promise<void> {
  await apiRequest<void>('/payments/cancel', {
    method: 'POST',
    token,
    tenantId,
    body: { tenantId, gateway },
  });
}
