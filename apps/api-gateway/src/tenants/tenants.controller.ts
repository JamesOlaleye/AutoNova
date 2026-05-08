import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantsGatewayService } from './tenants.gateway.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsGatewayService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new dealer tenant (public — no auth required)' })
  @ApiResponse({ status: 201, description: 'Tenant created' })
  @ApiResponse({ status: 409, description: 'Slug already taken' })
  create(@Body() body: CreateTenantDto) {
    return this.tenantsService.create(body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant record' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update tenant details' })
  @ApiResponse({ status: 200, description: 'Updated tenant' })
  update(@Param('id') id: string, @Body() body: UpdateTenantDto) {
    return this.tenantsService.update(id, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all tenants (platform admin only)' })
  @ApiResponse({ status: 200, description: 'Array of tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }
}
