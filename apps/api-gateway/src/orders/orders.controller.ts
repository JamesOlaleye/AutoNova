import { Body, Controller, Get, Inject, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, ORDER_PATTERNS } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(@Inject(SERVICES.ORDERS) private readonly ordersClient: ClientProxy) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  create(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.ordersClient.send(ORDER_PATTERNS.CREATE, { ...body, tenantId: req.tenantId }),
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  findAll(@Query() query: any, @Req() req: any) {
    return firstValueFrom(
      this.ordersClient.send(ORDER_PATTERNS.FIND_ALL, { ...query, tenantId: req.tenantId }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.ordersClient.send(ORDER_PATTERNS.FIND_BY_ID, { id, tenantId: req.tenantId }),
    );
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.ordersClient.send(ORDER_PATTERNS.UPDATE, { ...body, id, tenantId: req.tenantId }),
    );
  }
}
