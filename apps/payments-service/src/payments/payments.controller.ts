import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PAYMENT_PATTERNS,
  CreateSubscriptionPayload,
  CancelSubscriptionPayload,
} from '@autonova/types';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE_SUBSCRIPTION)
  createSubscription(@Payload() payload: CreateSubscriptionPayload) {
    return this.paymentsService.createSubscription(payload);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_SUBSCRIPTION)
  getSubscription(@Payload() payload: { tenantId: string }) {
    return this.paymentsService.getSubscription(payload.tenantId);
  }

  @MessagePattern(PAYMENT_PATTERNS.CANCEL_SUBSCRIPTION)
  cancelSubscription(@Payload() payload: CancelSubscriptionPayload) {
    return this.paymentsService.cancelSubscription(payload);
  }

  @MessagePattern(PAYMENT_PATTERNS.CREATE_PORTAL_SESSION)
  createPortalSession(@Payload() payload: { tenantId: string }) {
    return this.paymentsService.createPortalSession(payload.tenantId);
  }

  @MessagePattern(PAYMENT_PATTERNS.HANDLE_STRIPE_WEBHOOK)
  handleStripeWebhook(@Payload() payload: { payload: any; signature: string }) {
    return this.paymentsService.handleStripeWebhook(payload.payload, payload.signature);
  }

  @MessagePattern(PAYMENT_PATTERNS.HANDLE_PAYSTACK_WEBHOOK)
  handlePaystackWebhook(@Payload() payload: { payload: any; signature: string }) {
    return this.paymentsService.handlePaystackWebhook(payload.payload, payload.signature);
  }
}
