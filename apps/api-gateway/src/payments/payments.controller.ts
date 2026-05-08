import { Controller, Get, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentsGatewayService } from './payments.gateway.service';

@ApiTags('payments')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsGatewayService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a subscription (Stripe or Paystack)' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  createSubscription(@Req() req: any, @TenantId() tenantId: string) {
    return this.paymentsService.createSubscription(req.body, tenantId);
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
