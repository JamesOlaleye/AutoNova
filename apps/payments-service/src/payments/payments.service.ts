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

const PAYSTACK_PLAN_CODES: Record<string, string | undefined> = {
  STARTER: process.env.PAYSTACK_PLAN_STARTER_MONTHLY,
  GROWTH: process.env.PAYSTACK_PLAN_GROWTH_MONTHLY,
  PRO: process.env.PAYSTACK_PLAN_PRO_MONTHLY,
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

  async createPortalSession(tenantId: string): Promise<{ url: string } | null> {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } });
    if (!sub || sub.gateway !== 'STRIPE' || !sub.gatewayCustomerId) return null;
    if (!this.isStripeConfigured()) return null;

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: sub.gatewayCustomerId,
        return_url: process.env.STRIPE_PORTAL_RETURN_URL ?? 'http://localhost:3101/settings',
      });
      return { url: session.url };
    } catch (err: any) {
      this.logger.error(`[STRIPE] Portal session failed for tenant=${tenantId}: ${err.message}`);
      throw new RpcException({ message: 'Could not open billing portal. Ensure the Stripe Customer Portal is configured in your Stripe dashboard.', statusCode: 502 });
    }
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

    // Paystack: server-side disable requires the subscription's email_token (sent to customer on creation).
    // We mark cancelled in our DB — Paystack stops charging at end of current period automatically
    // when the subscription is not renewed. TODO: store email_token from subscription.create to enable
    // immediate Paystack server-side disable via POST /subscription/disable.

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
        await this.handleStripeSubscriptionDeleted(event.data.object as Stripe.Subscription);
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

    switch (parsed?.event) {
      case 'charge.success':
        // Only handle if this charge is tied to a subscription plan
        if (parsed.data?.plan) await this.handlePaystackChargeSuccess(parsed.data);
        break;
      case 'subscription.create':
        await this.handlePaystackSubscriptionCreate(parsed.data);
        break;
      case 'subscription.disable':
        await this.handlePaystackSubscriptionDisable(parsed.data);
        break;
    }

    return { received: true };
  }

  // ─── Stripe helpers ───────────────────────────────────────────────────────────

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

    const customerId = await this.getOrCreateStripeCustomer(payload.email, payload.tenantId, payload.plan);

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

  private async getOrCreateStripeCustomer(email: string, tenantId: string, plan: string): Promise<string> {
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

  private async handleStripeSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
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

  // ─── Paystack helpers ─────────────────────────────────────────────────────────

  private isPaystackConfigured(): boolean {
    const key = process.env.PAYSTACK_SECRET_KEY ?? '';
    // Real Paystack keys are ~50 chars: sk_test_xxxxxxxx... or sk_live_xxxxxxxx...
    return key.startsWith('sk_') && key.length > 20;
  }

  private async paystackCreateSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionResponse> {
    if (!this.isPaystackConfigured()) {
      this.logger.warn('[PAYSTACK] Secret key not configured — returning trial stub');
      return this.trialStub(payload, 'PAYSTACK');
    }

    const planCode = PAYSTACK_PLAN_CODES[payload.plan];
    if (!planCode || planCode.startsWith('PLN_placeholder')) {
      throw new RpcException({
        message: `Paystack plan not configured for ${payload.plan}. Add PAYSTACK_PLAN_${payload.plan}_MONTHLY to .env.`,
        statusCode: 500,
      });
    }

    // Fetch the plan's configured amount so the first charge matches the plan
    const amount = await this.fetchPaystackPlanAmount(planCode);

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        amount,
        plan: planCode,
        callback_url: process.env.PAYSTACK_SUCCESS_URL ?? 'http://localhost:3101/settings?upgraded=true',
        metadata: { tenantId: payload.tenantId, plan: payload.plan },
      }),
    });

    const json = await res.json() as any;
    if (!json.status || !json.data?.authorization_url) {
      this.logger.error(`[PAYSTACK] Initialize failed: ${json.message}`);
      throw new RpcException({ message: json.message ?? 'Paystack initialization failed', statusCode: 502 });
    }

    this.logger.log(`[PAYSTACK] Checkout initialized for tenant=${payload.tenantId} plan=${payload.plan}`);

    const sub = await this.upsertSubscription({
      tenantId: payload.tenantId,
      plan: payload.plan,
      status: 'TRIALING',
      gateway: 'PAYSTACK',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    return {
      id: sub.id,
      tenantId: sub.tenantId,
      plan: sub.plan as any,
      status: 'TRIALING',
      gateway: 'PAYSTACK',
      currentPeriodEnd: sub.currentPeriodEnd,
      checkoutUrl: json.data.authorization_url,
    };
  }

  private async fetchPaystackPlanAmount(planCode: string): Promise<number> {
    try {
      const res = await fetch(`https://api.paystack.co/plan/${planCode}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      const data = await res.json() as any;
      return data.data?.amount ?? 0;
    } catch {
      return 0;
    }
  }

  private async handlePaystackChargeSuccess(data: any): Promise<void> {
    const metadata = data.metadata ?? {};
    const tenantId = metadata.tenantId;
    const plan = metadata.plan;

    if (!tenantId || !plan) {
      this.logger.warn('[PAYSTACK] charge.success missing tenantId/plan in metadata');
      return;
    }

    // customer_code (CUS_xxx) is the stable identifier; fall back to numeric id
    const customerCode = data.customer?.customer_code ?? String(data.customer?.id ?? '');
    // next_payment_date comes from plan_object on the transaction; fall back to +30 days
    const periodEnd = data.plan_object?.next_payment_date
      ? new Date(data.plan_object.next_payment_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.upsertSubscription({
      tenantId,
      plan,
      status: 'ACTIVE',
      gateway: 'PAYSTACK',
      gatewayCustomerId: customerCode,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    });

    await this.updateTenantPlan(tenantId, plan);
    this.logger.log(`[PAYSTACK] Charge success — tenant=${tenantId} activated on ${plan}`);
  }

  private async handlePaystackSubscriptionCreate(data: any): Promise<void> {
    // Fires after charge.success; use it to attach the subscription code (SUB_xxx) to the record
    const subscriptionCode = data.subscription_code;
    const customerCode = data.customer?.customer_code ?? String(data.customer?.id ?? '');
    const nextPaymentDate = data.next_payment_date ? new Date(data.next_payment_date) : undefined;

    if (!subscriptionCode || !customerCode) return;

    await this.subscriptionRepo.update(
      { gatewayCustomerId: customerCode, gateway: 'PAYSTACK' },
      {
        gatewaySubscriptionId: subscriptionCode,
        ...(nextPaymentDate ? { currentPeriodEnd: nextPaymentDate } : {}),
      },
    );

    this.logger.log(`[PAYSTACK] Subscription created — code=${subscriptionCode} customer=${customerCode}`);
  }

  private async handlePaystackSubscriptionDisable(data: any): Promise<void> {
    const subscriptionCode = data.subscription_code;
    const customerCode = data.customer?.customer_code ?? String(data.customer?.id ?? '');

    // Try by subscription code first (most specific), then by customer code
    let sub: Subscription | null = null;
    if (subscriptionCode) {
      sub = await this.subscriptionRepo.findOne({ where: { gatewaySubscriptionId: subscriptionCode } });
    }
    if (!sub && customerCode) {
      sub = await this.subscriptionRepo.findOne({ where: { gatewayCustomerId: customerCode, gateway: 'PAYSTACK' } });
    }

    if (sub) {
      const tenantId = sub.tenantId;
      sub.status = 'CANCELLED';
      sub.cancelledAt = new Date();
      await this.subscriptionRepo.save(sub);
      await this.updateTenantPlan(tenantId, 'STARTER');
      this.logger.log(`[PAYSTACK] Subscription disabled — tenant=${tenantId} reverted to STARTER`);
    }
  }

  // ─── Shared helpers ───────────────────────────────────────────────────────────

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
