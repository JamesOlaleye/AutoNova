import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VehiclesGatewayService } from './vehicles.gateway.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

@ApiTags('vehicles')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesGatewayService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicles — public' })
  @ApiResponse({ status: 200, description: 'Paginated vehicle list' })
  findAll(@Query() query: VehicleQueryDto, @TenantId() tenantId: string) {
    return this.vehiclesService.findAll(query, tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search vehicles with filters — public' })
  @ApiResponse({ status: 200, description: 'Filtered paginated vehicles' })
  search(@Query() query: VehicleQueryDto, @TenantId() tenantId: string) {
    return this.vehiclesService.search(query, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle by ID — public' })
  @ApiResponse({ status: 200, description: 'Vehicle detail' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.vehiclesService.findOne(id, tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add a vehicle to inventory' })
  @ApiResponse({ status: 201, description: 'Vehicle created' })
  create(@Body() body: CreateVehicleDto, @TenantId() tenantId: string) {
    return this.vehiclesService.create(body, tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiResponse({ status: 200, description: 'Updated vehicle' })
  update(@Param('id') id: string, @Body() body: UpdateVehicleDto, @TenantId() tenantId: string) {
    return this.vehiclesService.update(id, body, tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remove a vehicle from inventory' })
  @ApiResponse({ status: 200, description: 'Vehicle removed' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.vehiclesService.remove(id, tenantId);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Upload a vehicle image' })
  @ApiResponse({ status: 201, description: 'Image uploaded — returns updated vehicle' })
  uploadImage(
    @Param('id') id: string,
    @Body() body: { base64: string },
    @TenantId() tenantId: string,
  ) {
    return this.vehiclesService.uploadImage(id, tenantId, body.base64);
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vehicle image' })
  @ApiResponse({ status: 200, description: 'Image deleted — returns updated vehicle' })
  deleteImage(
    @Param('id') id: string,
    @Body() body: { publicId: string; url: string },
    @TenantId() tenantId: string,
  ) {
    return this.vehiclesService.deleteImage(id, tenantId, body.publicId, body.url);
  }
}
