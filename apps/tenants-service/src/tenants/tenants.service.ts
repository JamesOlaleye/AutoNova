import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateTenantPayload, UpdateTenantPayload } from '@autonova/types';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(@InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>) {}

  async create(payload: CreateTenantPayload): Promise<Tenant> {
    const existing = await this.tenantRepo.findOne({ where: { slug: payload.slug } });
    if (existing) {
      throw new RpcException({ message: `Slug "${payload.slug}" is already taken`, statusCode: 409 });
    }
    const tenant = this.tenantRepo.create({ ...payload, plan: payload.plan || 'STARTER' });
    return this.tenantRepo.save(tenant);
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new RpcException({ message: 'Tenant not found', statusCode: 404 });
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (!tenant) throw new RpcException({ message: 'Tenant not found', statusCode: 404 });
    return tenant;
  }

  async update(payload: UpdateTenantPayload): Promise<Tenant> {
    const { id, ...updates } = payload;
    await this.tenantRepo.update({ id }, updates);
    return this.findById(id);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async deactivate(id: string): Promise<{ message: string }> {
    await this.tenantRepo.update({ id }, { isActive: false });
    return { message: 'Tenant deactivated' };
  }
}
