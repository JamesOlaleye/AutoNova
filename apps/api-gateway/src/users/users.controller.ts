import { Body, Controller, Delete, Get, Inject, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, USER_PATTERNS } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@Inject(SERVICES.USERS) private readonly usersClient: ClientProxy) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  findAll(@Query() query: any, @Req() req: any) {
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_ALL, { ...query, tenantId: req.tenantId }),
    );
  }

  @Get('me')
  getMe(@CurrentUser() user: any, @Req() req: any) {
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_BY_ID, { id: user.sub, tenantId: req.tenantId }),
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  findOne(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_BY_ID, { id, tenantId: req.tenantId }),
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.UPDATE, { ...body, id, tenantId: req.tenantId }),
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('DEALER_ADMIN', 'PLATFORM_ADMIN')
  remove(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.DELETE, { id, tenantId: req.tenantId }),
    );
  }
}
