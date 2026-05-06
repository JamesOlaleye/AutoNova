import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, PAYMENT_PATTERNS } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('payments')
export class PaymentsController {
  constructor(@Inject(SERVICES.PAYMENTS) private readonly paymentsClient: ClientProxy) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  createSubscription(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.paymentsClient.send(PAYMENT_PATTERNS.CREATE_SUBSCRIPTION, {
        ...body,
        tenantId: req.tenantId,
      }),
    );
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  getSubscription(@Req() req: any) {
    return firstValueFrom(
      this.paymentsClient.send(PAYMENT_PATTERNS.GET_SUBSCRIPTION, { tenantId: req.tenantId }),
    );
  }

  /** Stripe webhook — no auth, verified by stripe signature */
  @Post('webhooks/stripe')
  handleStripeWebhook(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.paymentsClient.send(PAYMENT_PATTERNS.HANDLE_STRIPE_WEBHOOK, {
        payload: body,
        signature: req.headers['stripe-signature'],
      }),
    );
  }

  /** Paystack webhook — no auth, verified by paystack signature */
  @Post('webhooks/paystack')
  handlePaystackWebhook(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.paymentsClient.send(PAYMENT_PATTERNS.HANDLE_PAYSTACK_WEBHOOK, {
        payload: body,
        signature: req.headers['x-paystack-signature'],
      }),
    );
  }
}
