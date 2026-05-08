import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { LeadsGatewayService } from './leads.gateway.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@ApiTags('leads')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsGatewayService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an enquiry or test drive request — public' })
  @ApiResponse({ status: 201, description: 'Lead created' })
  create(@Body() body: CreateLeadDto, @TenantId() tenantId: string) {
    return this.leadsService.create(body, tenantId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all leads for the tenant CRM' })
  @ApiResponse({ status: 200, description: 'Paginated lead list' })
  findAll(@Query() query: LeadQueryDto, @TenantId() tenantId: string) {
    return this.leadsService.findAll(query, tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get a lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead detail' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.leadsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEALER_ADMIN', 'SALES_AGENT', 'PLATFORM_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update lead status or assignment' })
  @ApiResponse({ status: 200, description: 'Updated lead' })
  update(@Param('id') id: string, @Body() body: UpdateLeadDto, @TenantId() tenantId: string) {
    return this.leadsService.update(id, body, tenantId);
  }
}
