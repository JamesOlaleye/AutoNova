import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from '@autonova/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthGatewayService } from './auth.gateway.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant UUID', required: true })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthGatewayService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user under a tenant' })
  @ApiResponse({ status: 201, description: 'User registered — returns tokens + user' })
  @ApiResponse({ status: 409, description: 'Email already exists for this tenant' })
  register(@Body() body: RegisterDto, @TenantId() tenantId: string) {
    return this.authService.register(body, tenantId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful — returns tokens + user' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() body: LoginDto, @TenantId() tenantId: string) {
    return this.authService.login(body, tenantId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and get new access token' })
  @ApiResponse({ status: 200, description: 'Returns new token pair' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() body: RefreshTokenDto, @TenantId() tenantId: string) {
    return this.authService.refresh(body, tenantId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout — revokes all refresh tokens for this session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@CurrentUser() user: JwtPayload, @TenantId() tenantId: string) {
    return this.authService.logout(user.sub, tenantId);
  }
}
