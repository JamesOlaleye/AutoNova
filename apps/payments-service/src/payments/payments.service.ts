import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import Stripe from 'stripe';
import {
  CancelSubscriptionPayload,
  CreateSubscriptionPayload,
  SubscriptionResponse,
} from '@autonova/types';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
  }

  async createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    if (payload.gateway === 'STRIPE') {
      return this.stripeCreateSubscription(payload);
    }
    return this.paystackCreateSubscription(payload);
  }

  async getSubscription(tenantId: string): Promise<SubscriptionResponse | null> {
    // TODO: look up active subscription from DB (added when payments DB entity is created in Phase 3)
    this.logger.log(`[GET_SUBSCRIPTION] tenantId=${tenantId}`);
    return null;
  }

  async cancelSubscription(payload: CancelSubscriptionPayload): Promise<{ cancelled: boolean }> {
    this.logger.log(`[CANCEL] tenantId=${payload.tenantId} gateway=${payload.gateway}`);
    // TODO: call Stripe/Paystack cancel API
    return { cancelled: true };
  }

  async handleStripeWebhook(rawPayload: any, signature: string): Promise<{ received: boolean }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawPayload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
      this.logger.log(`[STRIPE WEBHOOK] ${event.type}`);
      // TODO: handle invoice.paid, customer.subscription.deleted, etc.
    } catch (err) {
      this.logger.error(`[STRIPE WEBHOOK] Signature verification failed: ${err.message}`);
    }
    return { received: true };
  }

  async handlePaystackWebhook(payload: any, signature: string): Promise<{ received: boolean }> {
    const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      this.logger.error('[PAYSTACK WEBHOOK] Invalid signature');
      return { received: false };
    }

    this.logger.log(`[PAYSTACK WEBHOOK] ${payload?.event}`);
    // TODO: handle charge.success, subscription.disable, etc.
    return { received: true };
  }

  private async stripeCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    // TODO: create Stripe customer + subscription
    this.logger.log(`[STRIPE] Creating ${payload.plan} subscription for tenant=${payload.tenantId}`);
    return {
      id: 'stripe_sub_placeholder',
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway: 'STRIPE',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
  }

  private async paystackCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    // TODO: create Paystack customer + subscription plan
    this.logger.log(`[PAYSTACK] Creating ${payload.plan} subscription for tenant=${payload.tenantId}`);
    return {
      id: 'paystack_sub_placeholder',
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway: 'PAYSTACK',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
  }
}
