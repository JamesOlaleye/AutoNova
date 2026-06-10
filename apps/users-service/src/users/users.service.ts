import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom, timeout } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserPayload,
  PaginatedResponse,
  UpdateUserPayload,
  SERVICES,
  TENANT_PATTERNS,
  TenantPlanLimits,
} from '@autonova/types';
import { User } from './entities/user.entity';

const STAFF_ROLES = new Set(['DEALER_ADMIN', 'SALES_AGENT', 'FINANCE_MANAGER']);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject(SERVICES.TENANTS) private readonly tenantsClient: ClientProxy,
  ) {}

  async create(payload: CreateUserPayload): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepo.findOne({
      where: { email: payload.email, tenantId: payload.tenantId },
    });
    if (existing) {
      throw new RpcException({ message: 'Email already registered', statusCode: 409 });
    }
    const role = payload.role || 'CUSTOMER';
    if (STAFF_ROLES.has(role)) {
      await this.enforceStaffLimit(payload.tenantId);
    }
    const user = this.userRepo.create({ ...payload, role });
    const saved = await this.userRepo.save(user);
    return this.sanitize(saved);
  }

  private async enforceStaffLimit(tenantId: string): Promise<void> {
    const [planData, count] = await Promise.all([
      firstValueFrom<TenantPlanLimits>(
        (this.tenantsClient.send(TENANT_PATTERNS.GET_PLAN, { tenantId }) as any).pipe(timeout(5000)),
      ),
      this.userRepo.count({
        where: [
          { tenantId, role: 'DEALER_ADMIN' },
          { tenantId, role: 'SALES_AGENT' },
          { tenantId, role: 'FINANCE_MANAGER' },
        ],
      }),
    ]);
    if (planData.staffLimit !== -1 && count >= planData.staffLimit) {
      throw new RpcException({
        message: `Staff limit reached for your ${planData.plan} plan (${planData.staffLimit} staff). Please upgrade to add more.`,
        statusCode: 402,
      });
    }
  }

  async findById(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new RpcException({ message: 'User not found', statusCode: 404 });
    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email, tenantId } });
    if (!user) throw new RpcException({ message: 'User not found', statusCode: 404 });
    return user; // includes password — needed for auth-service comparison
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Omit<User, 'password'>>> {
    const [data, total] = await this.userRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data.map(this.sanitize),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(payload: UpdateUserPayload): Promise<Omit<User, 'password'>> {
    const { id, tenantId, ...updates } = payload;
    await this.userRepo.update({ id, tenantId }, updates);
    const updated = await this.findById(id, tenantId);
    return this.sanitize(updated);
  }

  async changePassword(payload: {
    id: string;
    tenantId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: payload.id, tenantId: payload.tenantId } });
    if (!user) throw new RpcException({ message: 'User not found', statusCode: 404 });

    const valid = await bcrypt.compare(payload.currentPassword, user.password);
    if (!valid) throw new RpcException({ message: 'Current password is incorrect', statusCode: 400 });

    const hashed = await bcrypt.hash(payload.newPassword, 12);
    await this.userRepo.update({ id: payload.id, tenantId: payload.tenantId }, { password: hashed });
    return { message: 'Password changed successfully' };
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    await this.userRepo.update({ id, tenantId }, { isActive: false });
    return { message: 'User deactivated' };
  }

  private sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest as Omit<User, 'password'>;
  }
}
