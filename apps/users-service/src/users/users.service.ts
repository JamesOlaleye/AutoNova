import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateUserPayload, PaginatedResponse, UpdateUserPayload } from '@autonova/types';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async create(payload: CreateUserPayload): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepo.findOne({
      where: { email: payload.email, tenantId: payload.tenantId },
    });
    if (existing) {
      throw new RpcException({ message: 'Email already registered', statusCode: 409 });
    }
    const user = this.userRepo.create({ ...payload, role: payload.role || 'CUSTOMER' });
    const saved = await this.userRepo.save(user);
    return this.sanitize(saved);
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

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    await this.userRepo.update({ id, tenantId }, { isActive: false });
    return { message: 'User deactivated' };
  }

  private sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest as Omit<User, 'password'>;
  }
}
