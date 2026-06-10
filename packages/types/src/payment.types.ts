import { TenantPlan } from './common.types';

export type PaymentGateway = 'STRIPE' | 'PAYSTACK';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';

export interface CreateSubscriptionPayload {
  tenantId: string;
  plan: TenantPlan;
  gateway: PaymentGateway;
  email: string;
  currency: string;
}

export interface CancelSubscriptionPayload {
  tenantId: string;
  gateway: PaymentGateway;
}

export interface SubscriptionResponse {
  id: string;
  tenantId: string;
  plan: TenantPlan;
  status: SubscriptionStatus;
  gateway: PaymentGateway;
  currentPeriodEnd: Date;
  checkoutUrl?: string;
}
