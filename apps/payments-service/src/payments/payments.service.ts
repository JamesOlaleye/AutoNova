import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import Stripe from 'stripe';
import {
  CancelSubscriptionPayload,
  CreateSubscriptionPayload,
  SubscriptionResponse,
} from '@autonova/types';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
  }

  async createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    if (payload.gateway === 'STRIPE') {
      return this.stripeCreateSubscription(payload);
    }
    return this.paystackCreateSubscription(payload);
  }

  async getSubscription(tenantId: string): Promise<SubscriptionResponse | null> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      tenantId: sub.tenantId,
      plan: sub.plan as any,
      status: sub.status as any,
      gateway: sub.gateway as any,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }

  async cancelSubscription(payload: CancelSubscriptionPayload): Promise<{ cancelled: boolean }> {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId: payload.tenantId } });
    if (sub) {
      sub.status = 'CANCELLED';
      sub.cancelledAt = new Date();
      await this.subscriptionRepo.save(sub);
    }
    this.logger.log(`[CANCEL] tenantId=${payload.tenantId} gateway=${payload.gateway}`);
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

      if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
        const stripeSub = event.data.object as Stripe.Subscription;
        await this.upsertFromStripe(stripeSub);
      }
      if (event.type === 'customer.subscription.deleted') {
        const stripeSub = event.data.object as Stripe.Subscription;
        await this.subscriptionRepo.update(
          { gatewaySubscriptionId: stripeSub.id },
          { status: 'CANCELLED', cancelledAt: new Date() },
        );
      }
    } catch (err) {
      this.logger.error(`[STRIPE WEBHOOK] Signature verification failed: ${err.message}`);
    }
    return { received: true };
  }

  async handlePaystackWebhook(payload: string, signature: string): Promise<{ received: boolean }> {
    const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(payload)
      .digest('hex');

    if (hash !== signature) {
      this.logger.error('[PAYSTACK WEBHOOK] Invalid signature');
      return { received: false };
    }

    const parsed = JSON.parse(payload);
    this.logger.log(`[PAYSTACK WEBHOOK] ${parsed?.event}`);

    if (parsed?.event === 'subscription.disable') {
      const customerId = parsed?.data?.customer?.id;
      if (customerId) {
        await this.subscriptionRepo.update(
          { gatewayCustomerId: String(customerId) },
          { status: 'CANCELLED', cancelledAt: new Date() },
        );
      }
    }
    return { received: true };
  }

  private async stripeCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    this.logger.log(`[STRIPE] Creating ${payload.plan} subscription for tenant=${payload.tenantId}`);

    // Real Stripe call requires STRIPE_SECRET_KEY and pre-created Price IDs in the Stripe dashboard.
    // Wire this up once credentials are set.
    const periodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const sub = await this.upsertSubscription({
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway: 'STRIPE',
      gatewaySubscriptionId: null,
      gatewayCustomerId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    });

    return { id: sub.id, tenantId: sub.tenantId, plan: sub.plan as any, status: sub.status as any, gateway: 'STRIPE', currentPeriodEnd: periodEnd };
  }

  private async paystackCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    this.logger.log(`[PAYSTACK] Creating ${payload.plan} subscription for tenant=${payload.tenantId}`);

    // Real Paystack call requires PAYSTACK_SECRET_KEY and pre-created plan codes in Paystack.
    // Wire this up once credentials are set.
    const periodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const sub = await this.upsertSubscription({
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway: 'PAYSTACK',
      gatewaySubscriptionId: null,
      gatewayCustomerId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    });

    return { id: sub.id, tenantId: sub.tenantId, plan: sub.plan as any, status: sub.status as any, gateway: 'PAYSTACK', currentPeriodEnd: periodEnd };
  }

  private async upsertSubscription(data: Partial<Subscription>): Promise<Subscription> {
    let sub = await this.subscriptionRepo.findOne({ where: { tenantId: data.tenantId } });
    if (sub) {
      Object.assign(sub, data);
    } else {
      sub = this.subscriptionRepo.create(data);
    }
    return this.subscriptionRepo.save(sub);
  }

  private async upsertFromStripe(stripeSub: Stripe.Subscription): Promise<void> {
    await this.upsertSubscription({
      tenantId: stripeSub.metadata?.tenantId,
      plan: stripeSub.metadata?.plan ?? 'STARTER',
      status: stripeSub.status === 'active' ? 'ACTIVE' : stripeSub.status === 'trialing' ? 'TRIALING' : 'PAST_DUE',
      gateway: 'STRIPE',
      gatewaySubscriptionId: stripeSub.id,
      gatewayCustomerId: stripeSub.customer as string,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    });
  }
}
