import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateLeadPayload, PaginatedResponse, UpdateLeadPayload } from '@autonova/types';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(@InjectRepository(Lead) private readonly leadRepo: Repository<Lead>) {}

  async create(payload: CreateLeadPayload): Promise<Lead> {
    return this.leadRepo.save(this.leadRepo.create(payload));
  }

  async findById(id: string, tenantId: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id, tenantId } });
    if (!lead) throw new RpcException({ message: 'Lead not found', statusCode: 404 });
    return lead;
  }

  async findAll(tenantId: string, page = 1, limit = 20): Promise<PaginatedResponse<Lead>> {
    const [data, total] = await this.leadRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(payload: UpdateLeadPayload): Promise<Lead> {
    const { id, tenantId, ...updates } = payload;
    await this.leadRepo.update({ id, tenantId }, updates as any);
    return this.findById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    await this.leadRepo.delete({ id, tenantId });
    return { message: 'Lead deleted' };
  }
}
