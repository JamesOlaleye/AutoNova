import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom, timeout } from 'rxjs';
import { createHmac } from 'crypto';
import Stripe from 'stripe';
import {
  CancelSubscriptionPayload,
  CreateSubscriptionPayload,
  SubscriptionResponse,
  SERVICES,
  TENANT_PATTERNS,
} from '@autonova/types';
import { Subscription } from './entities/subscription.entity';

const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  STARTER: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  GROWTH: process.env.STRIPE_PRICE_GROWTH_MONTHLY,
  PRO: process.env.STRIPE_PRICE_PRO_MONTHLY,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @Inject(SERVICES.TENANTS)
    private readonly tenantsClient: ClientProxy,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
  }

  async createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    if (payload.gateway === 'STRIPE') return this.stripeCreateSubscription(payload);
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
    if (!sub) return { cancelled: true };

    if (sub.gateway === 'STRIPE' && sub.gatewaySubscriptionId && this.isStripeConfigured()) {
      try {
        await this.stripe.subscriptions.cancel(sub.gatewaySubscriptionId);
        this.logger.log(`[STRIPE] Cancelled subscription ${sub.gatewaySubscriptionId}`);
      } catch (err: any) {
        this.logger.warn(`[STRIPE] Cancel failed for ${sub.gatewaySubscriptionId}: ${err.message}`);
      }
    }

    sub.status = 'CANCELLED';
    sub.cancelledAt = new Date();
    await this.subscriptionRepo.save(sub);
    return { cancelled: true };
  }

  async handleStripeWebhook(rawPayload: any, signature: string): Promise<{ received: boolean }> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawPayload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err: any) {
      this.logger.error(`[STRIPE WEBHOOK] Signature verification failed: ${err.message}`);
      return { received: true };
    }

    this.logger.log(`[STRIPE WEBHOOK] ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await this.upsertFromStripe(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
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

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private isStripeConfigured(): boolean {
    const key = process.env.STRIPE_SECRET_KEY ?? '';
    return key.startsWith('sk_') && key.length > 10;
  }

  private async stripeCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    if (!this.isStripeConfigured()) {
      this.logger.warn('[STRIPE] Secret key not configured — returning trial stub');
      return this.trialStub(payload, 'STRIPE');
    }

    const priceId = STRIPE_PRICE_IDS[payload.plan];
    if (!priceId || priceId.startsWith('price_placeholder')) {
      throw new RpcException({
        message: `Stripe price not configured for plan ${payload.plan}. Add STRIPE_PRICE_${payload.plan}_MONTHLY to .env.`,
        statusCode: 500,
      });
    }

    // Create or retrieve Stripe Customer
    const customerId = await this.getOrCreateStripeCustomer(payload.email, payload.tenantId, payload.plan);

    // Create Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tenantId: payload.tenantId, plan: payload.plan },
      subscription_data: { metadata: { tenantId: payload.tenantId, plan: payload.plan } },
      success_url: `${process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:3101/settings'}?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL ?? 'http://localhost:3101/settings',
    });

    this.logger.log(`[STRIPE] Checkout session created for tenant=${payload.tenantId} plan=${payload.plan}`);

    const sub = await this.upsertSubscription({
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway: 'STRIPE',
      gatewayCustomerId: customerId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    return {
      id: sub.id,
      tenantId: sub.tenantId,
      plan: sub.plan as any,
      status: 'TRIALING',
      gateway: 'STRIPE',
      currentPeriodEnd: sub.currentPeriodEnd,
      checkoutUrl: session.url!,
    };
  }

  private async paystackCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    this.logger.log(`[PAYSTACK] Creating ${payload.plan} subscription for tenant=${payload.tenantId}`);
    return this.trialStub(payload, 'PAYSTACK');
  }

  private async trialStub(payload: CreateSubscriptionPayload, gateway: 'STRIPE' | 'PAYSTACK'): Promise<SubscriptionResponse> {
    const periodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const sub = await this.upsertSubscription({
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    });
    return { id: sub.id, tenantId: sub.tenantId, plan: sub.plan as any, status: 'TRIALING', gateway, currentPeriodEnd: periodEnd };
  }

  private async getOrCreateStripeCustomer(email: string, tenantId: string, plan: string): Promise<string> {
    // Search by email first to avoid duplicate customers
    const existing = await this.stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      const customer = existing.data[0];
      await this.stripe.customers.update(customer.id, { metadata: { tenantId, plan } });
      return customer.id;
    }
    const customer = await this.stripe.customers.create({ email, metadata: { tenantId, plan } });
    return customer.id;
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
    const tenantId = session.metadata?.tenantId;
    const plan = session.metadata?.plan;
    if (!tenantId || !session.subscription) return;

    const stripeSub = await this.stripe.subscriptions.retrieve(session.subscription as string);
    await this.upsertSubscription({
      tenantId,
      plan: plan ?? 'STARTER',
      status: 'ACTIVE',
      gateway: 'STRIPE',
      gatewaySubscriptionId: stripeSub.id,
      gatewayCustomerId: stripeSub.customer as string,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    });

    await this.updateTenantPlan(tenantId, plan ?? 'STARTER');
    this.logger.log(`[STRIPE] Checkout completed — tenant=${tenantId} activated on ${plan}`);
  }

  private async handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
    await this.subscriptionRepo.update(
      { gatewaySubscriptionId: stripeSub.id },
      { status: 'CANCELLED', cancelledAt: new Date() },
    );
    const tenantId = stripeSub.metadata?.tenantId;
    if (tenantId) {
      await this.updateTenantPlan(tenantId, 'STARTER');
      this.logger.log(`[STRIPE] Subscription deleted — tenant=${tenantId} reverted to STARTER`);
    }
  }

  private async upsertFromStripe(stripeSub: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSub.metadata?.tenantId;
    if (!tenantId) return;
    const status =
      stripeSub.status === 'active' ? 'ACTIVE' :
      stripeSub.status === 'trialing' ? 'TRIALING' : 'PAST_DUE';

    await this.upsertSubscription({
      tenantId,
      plan: stripeSub.metadata?.plan ?? 'STARTER',
      status,
      gateway: 'STRIPE',
      gatewaySubscriptionId: stripeSub.id,
      gatewayCustomerId: stripeSub.customer as string,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    });
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

  private async updateTenantPlan(tenantId: string, plan: string): Promise<void> {
    try {
      await firstValueFrom(
        (this.tenantsClient.send(TENANT_PATTERNS.UPDATE, { id: tenantId, plan }) as any)
          .pipe(timeout(5000)),
      );
    } catch (err: any) {
      this.logger.error(`[PAYMENTS] Failed to update tenant plan for ${tenantId}: ${err.message}`);
    }
  }
}
