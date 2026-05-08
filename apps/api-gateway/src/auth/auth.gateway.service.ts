import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS, SERVICES } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.AUTH) private readonly client: ClientProxy) {
    super();
  }

  register(dto: RegisterDto, tenantId: string) {
    return this.send(this.client, AUTH_PATTERNS.REGISTER, { ...dto, tenantId });
  }

  login(dto: LoginDto, tenantId: string) {
    return this.send(this.client, AUTH_PATTERNS.LOGIN, { ...dto, tenantId });
  }

  refresh(dto: RefreshTokenDto, tenantId: string) {
    return this.send(this.client, AUTH_PATTERNS.REFRESH, { ...dto, tenantId });
  }

  logout(userId: string, tenantId: string) {
    return this.send(this.client, AUTH_PATTERNS.LOGOUT, { userId, tenantId });
  }
}
