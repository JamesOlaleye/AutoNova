import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  AuthResponse,
  AuthTokens,
  LoginPayload,
  LogoutPayload,
  RefreshPayload,
  RegisterPayload,
  SERVICES,
  USER_PATTERNS,
} from '@autonova/types';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    @Inject(SERVICES.USERS) private readonly usersClient: ClientProxy,
  ) {}

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(
      payload.password,
      parseInt(process.env.BCRYPT_ROUNDS || '12'),
    );

    const user = await firstValueFrom(
      this.usersClient.send(USER_PATTERNS.CREATE, { ...payload, password: hashedPassword }),
    );

    if (!user || user.error) {
      throw new RpcException(user?.error || 'Registration failed');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role, payload.tenantId);
    await this.saveRefreshToken(user.id, payload.tenantId, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const user = await firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_BY_EMAIL, {
        email: payload.email,
        tenantId: payload.tenantId,
      }),
    );

    if (!user || user.error) {
      throw new RpcException({ message: 'Invalid credentials', statusCode: 401 });
    }

    const isValid = await bcrypt.compare(payload.password, user.password);
    if (!isValid) {
      throw new RpcException({ message: 'Invalid credentials', statusCode: 401 });
    }

    if (!user.isActive) {
      throw new RpcException({ message: 'Account is deactivated', statusCode: 403 });
    }

    const tokens = this.generateTokens(user.id, user.email, user.role, payload.tenantId);
    await this.rotateRefreshToken(user.id, payload.tenantId, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async refresh(payload: RefreshPayload): Promise<AuthTokens> {
    const tokenHash = this.hashToken(payload.refreshToken);

    const record = await this.refreshTokenRepo.findOne({
      where: { tokenHash, tenantId: payload.tenantId, isRevoked: false },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new RpcException({ message: 'Invalid or expired refresh token', statusCode: 401 });
    }

    const user = await firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_BY_ID, {
        id: record.userId,
        tenantId: payload.tenantId,
      }),
    );

    if (!user || !user.isActive) {
      throw new RpcException({ message: 'User not found', statusCode: 401 });
    }

    const tokens = this.generateTokens(user.id, user.email, user.role, payload.tenantId);

    record.isRevoked = true;
    await this.refreshTokenRepo.save(record);
    await this.saveRefreshToken(user.id, payload.tenantId, tokens.refreshToken);

    return tokens;
  }

  async logout(payload: LogoutPayload): Promise<{ message: string }> {
    await this.refreshTokenRepo.update(
      { userId: payload.userId, tenantId: payload.tenantId, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Logged out successfully' };
  }

  private generateTokens(userId: string, email: string, role: string, tenantId: string): AuthTokens {
    const jwtPayload = { sub: userId, email, role, tenantId };
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });
    const refreshToken = randomBytes(40).toString('hex');
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, tenantId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId,
        tenantId,
        tokenHash: this.hashToken(token),
        expiresAt,
        isRevoked: false,
      }),
    );
  }

  private async rotateRefreshToken(userId: string, tenantId: string, newToken: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { userId, tenantId, isRevoked: false },
      { isRevoked: true },
    );
    await this.saveRefreshToken(userId, tenantId, newToken);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
