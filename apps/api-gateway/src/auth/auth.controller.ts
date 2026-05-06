import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_PATTERNS, SERVICES } from '@autonova/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject(SERVICES.AUTH) private readonly authClient: ClientProxy) {}

  @Post('register')
  register(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.REGISTER, { ...body, tenantId: req.tenantId }),
    );
  }

  @Post('login')
  login(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.LOGIN, { ...body, tenantId: req.tenantId }),
    );
  }

  @Post('refresh')
  refresh(@Body() body: any, @Req() req: any) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.REFRESH, { ...body, tenantId: req.tenantId }),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: any, @Req() req: any) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.LOGOUT, { userId: user.sub, tenantId: req.tenantId }),
    );
  }
}
