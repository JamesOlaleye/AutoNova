import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_PATTERNS, LoginPayload, LogoutPayload, RefreshPayload, RegisterPayload } from '@autonova/types';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() payload: RegisterPayload) {
    return this.authService.register(payload);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() payload: LoginPayload) {
    return this.authService.login(payload);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH)
  refresh(@Payload() payload: RefreshPayload) {
    return this.authService.refresh(payload);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  logout(@Payload() payload: LogoutPayload) {
    return this.authService.logout(payload);
  }
}
