import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OrdersGatewayService } from './orders.gateway.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersGatewayService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Create a new deal / order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  create(@Body() body: CreateOrderDto, @TenantId() tenantId: string) {
    return this.ordersService.create(body, tenantId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'List all orders for the tenant' })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  findAll(@Query() query: OrderQueryDto, @TenantId() tenantId: string) {
    return this.ordersService.findAll(query, tenantId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.findOne(id, tenantId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update order status or details' })
  @ApiResponse({ status: 200, description: 'Updated order' })
  update(@Param('id') id: string, @Body() body: UpdateOrderDto, @TenantId() tenantId: string) {
    return this.ordersService.update(id, body, tenantId);
  }
}
