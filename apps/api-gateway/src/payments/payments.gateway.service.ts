import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_PATTERNS, SERVICES } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';

@Injectable()
export class PaymentsGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.PAYMENTS) private readonly client: ClientProxy) {
    super();
  }

  createSubscription(payload: any, tenantId: string) {
    return this.send(this.client, PAYMENT_PATTERNS.CREATE_SUBSCRIPTION, { ...payload, tenantId });
  }

  getSubscription(tenantId: string) {
    return this.send(this.client, PAYMENT_PATTERNS.GET_SUBSCRIPTION, { tenantId });
  }

  handleStripeWebhook(rawBody: Buffer, signature: string) {
    return this.send(this.client, PAYMENT_PATTERNS.HANDLE_STRIPE_WEBHOOK, {
      payload: rawBody,
      signature,
    });
  }

  handlePaystackWebhook(rawBody: string, signature: string) {
    return this.send(this.client, PAYMENT_PATTERNS.HANDLE_PAYSTACK_WEBHOOK, {
      payload: rawBody,
      signature,
    });
  }
}
