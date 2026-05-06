import { Body, Controller, Get, Inject, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, LEAD_PATTERNS } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('leads')
export class LeadsController {
  constructor(@Inject(SERVICES.LEADS) private readonly leadsClient: ClientProxy) {}

  /** Public: submit inquiry / test drive request */
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.leadsClient.send(LEAD_PATTERNS.CREATE, { ...body, tenantId: req.tenantId }),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  findAll(@Query() query: any, @Req() req: any) {
    return firstValueFrom(
      this.leadsClient.send(LEAD_PATTERNS.FIND_ALL, { ...query, tenantId: req.tenantId }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  findOne(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.leadsClient.send(LEAD_PATTERNS.FIND_BY_ID, { id, tenantId: req.tenantId }),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.leadsClient.send(LEAD_PATTERNS.UPDATE, { ...body, id, tenantId: req.tenantId }),
    );
  }
}
