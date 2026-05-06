import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, VEHICLE_PATTERNS } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('vehicles')
export class VehiclesController {
  constructor(@Inject(SERVICES.VEHICLES) private readonly vehiclesClient: ClientProxy) {}

  /** Public: browse inventory */
  @Get()
  findAll(@Query() query: any, @Req() req: any) {
    return firstValueFrom(
      this.vehiclesClient.send(VEHICLE_PATTERNS.FIND_ALL, { ...query, tenantId: req.tenantId }),
    );
  }

  @Get('search')
  search(@Query() query: any, @Req() req: any) {
    return firstValueFrom(
      this.vehiclesClient.send(VEHICLE_PATTERNS.SEARCH, { ...query, tenantId: req.tenantId }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.vehiclesClient.send(VEHICLE_PATTERNS.FIND_BY_ID, { id, tenantId: req.tenantId }),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  create(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.vehiclesClient.send(VEHICLE_PATTERNS.CREATE, { ...body, tenantId: req.tenantId }),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.vehiclesClient.send(VEHICLE_PATTERNS.UPDATE, { ...body, id, tenantId: req.tenantId }),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  remove(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.vehiclesClient.send(VEHICLE_PATTERNS.DELETE, { id, tenantId: req.tenantId }),
    );
  }
}
