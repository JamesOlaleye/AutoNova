import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, TENANT_PATTERNS } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('tenants')
export class TenantsController {
  constructor(@Inject(SERVICES.TENANTS) private readonly tenantsClient: ClientProxy) {}

  /** Public: dealer signup */
  @Post()
  create(@Body() body: any) {
    return firstValueFrom(this.tenantsClient.send(TENANT_PATTERNS.CREATE, body));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.tenantsClient.send(TENANT_PATTERNS.FIND_BY_ID, { id }));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.tenantsClient.send(TENANT_PATTERNS.UPDATE, { ...body, id }));
  }

  /** Platform admin only */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  findAll() {
    return firstValueFrom(this.tenantsClient.send(TENANT_PATTERNS.GET_ALL, {}));
  }
}
