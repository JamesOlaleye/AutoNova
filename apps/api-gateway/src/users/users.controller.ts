import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from '@autonova/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersGatewayService } from './users.gateway.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersGatewayService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'List all users in the tenant' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  findAll(@Query() query: UserQueryDto, @TenantId() tenantId: string) {
    return this.usersService.findAll(query, tenantId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getMe(@CurrentUser() user: JwtPayload, @TenantId() tenantId: string) {
    return this.usersService.findOne(user.sub, tenantId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User record' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Updated user' })
  update(@Param('id') id: string, @Body() body: UpdateUserDto, @TenantId() tenantId: string) {
    return this.usersService.update(id, body, tenantId);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change own password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Current password incorrect' })
  changePassword(@Body() body: ChangePasswordDto, @CurrentUser() user: JwtPayload, @TenantId() tenantId: string) {
    return this.usersService.changePassword(user.sub, body, tenantId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.remove(id, tenantId);
  }
}
