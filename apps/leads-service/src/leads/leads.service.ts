import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  SERVICES,
  NOTIFICATION_PATTERNS,
  CreateLeadPayload,
  PaginatedResponse,
  UpdateLeadPayload,
  LeadType,
} from '@autonova/types';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @Inject(SERVICES.NOTIFICATIONS) private readonly notificationsClient: ClientProxy,
  ) {}

  async create(payload: CreateLeadPayload): Promise<Lead> {
    const lead = await this.leadRepo.save(this.leadRepo.create(payload));

    // Fire-and-forget — never block lead creation waiting for notification delivery
    this.notificationsClient
      .emit(NOTIFICATION_PATTERNS.NOTIFY_NEW_LEAD, {
        tenantId: lead.tenantId,
        leadId: lead.id,
        customerName: lead.name,
        customerEmail: lead.email,
        customerPhone: lead.phone || undefined,
        enquiryType: lead.type,
        message: lead.message || undefined,
        vehicleId: lead.vehicleId || undefined,
      })
      .subscribe({
        error: (err) =>
          this.logger.error(
            `Failed to emit NOTIFY_NEW_LEAD for lead ${lead.id}: ${err?.message}`,
          ),
      });

    return lead;
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

    // Capture previous assignedTo before updating — only notify on a NEW assignment
    const previous = await this.findById(id, tenantId);
    await this.leadRepo.update({ id, tenantId }, updates as any);
    const lead = await this.findById(id, tenantId);

    // Fire-and-forget SMS only when assignedTo changes to a different user
    const isNewAssignment =
      updates.assignedTo &&
      updates.assignedTo !== previous.assignedTo;

    if (isNewAssignment) {
      this.notificationsClient
        .emit(NOTIFICATION_PATTERNS.NOTIFY_LEAD_ASSIGNED, {
          tenantId,
          leadId: id,
          assignedToUserId: updates.assignedTo,
          customerName: lead.name,
          enquiryType: lead.type as LeadType,
        })
        .subscribe({
          error: (err) =>
            this.logger.error(
              `Failed to emit NOTIFY_LEAD_ASSIGNED for lead ${id}: ${err?.message}`,
            ),
        });
    }

    return lead;
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    await this.leadRepo.delete({ id, tenantId });
    return { message: 'Lead deleted' };
  }
}
