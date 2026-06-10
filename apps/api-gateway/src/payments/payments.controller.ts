import { Body, Controller, Get, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentsGatewayService } from './payments.gateway.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@ApiTags('payments')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsGatewayService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a Stripe or Paystack subscription — returns checkoutUrl for Stripe' })
  @ApiResponse({ status: 201, description: 'Subscription record created; checkoutUrl present for Stripe redirect' })
  createSubscription(@Body() body: CreateSubscriptionDto, @TenantId() tenantId: string) {
    return this.paymentsService.createSubscription(body, tenantId);
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current subscription for the tenant' })
  @ApiResponse({ status: 200, description: 'Active subscription or null' })
  getSubscription(@TenantId() tenantId: string) {
    return this.paymentsService.getSubscription(tenantId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cancel the active subscription for the tenant' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  cancelSubscription(@Body() body: CancelSubscriptionDto, @TenantId() tenantId: string) {
    return this.paymentsService.cancelSubscription(body, tenantId);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a Stripe Customer Portal session — returns url to redirect the dealer to' })
  @ApiResponse({ status: 200, description: 'Portal session URL, or null for non-Stripe tenants' })
  createPortalSession(@TenantId() tenantId: string) {
    return this.paymentsService.createPortalSession(tenantId);
  }

  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Stripe webhook endpoint — do not call manually' })
  handleStripeWebhook(@Req() req: RawBodyRequest<any>) {
    return this.paymentsService.handleStripeWebhook(
      req.rawBody,
      req.headers['stripe-signature'] as string,
    );
  }

  @Post('webhooks/paystack')
  @ApiOperation({ summary: 'Paystack webhook endpoint — do not call manually' })
  handlePaystackWebhook(@Req() req: RawBodyRequest<any>) {
    return this.paymentsService.handlePaystackWebhook(
      req.rawBody?.toString(),
      req.headers['x-paystack-signature'] as string,
    );
  }
}
