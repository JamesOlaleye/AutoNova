import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LEAD_PATTERNS, CreateLeadPayload, UpdateLeadPayload } from '@autonova/types';
import { LeadsService } from './leads.service';

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @MessagePattern(LEAD_PATTERNS.CREATE)
  create(@Payload() payload: CreateLeadPayload) {
    return this.leadsService.create(payload);
  }

  @MessagePattern(LEAD_PATTERNS.FIND_BY_ID)
  findById(@Payload() payload: { id: string; tenantId: string }) {
    return this.leadsService.findById(payload.id, payload.tenantId);
  }

  @MessagePattern(LEAD_PATTERNS.FIND_ALL)
  findAll(@Payload() payload: { tenantId: string; page?: number; limit?: number }) {
    return this.leadsService.findAll(payload.tenantId, payload.page, payload.limit);
  }

  @MessagePattern(LEAD_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateLeadPayload) {
    return this.leadsService.update(payload);
  }

  @MessagePattern(LEAD_PATTERNS.DELETE)
  remove(@Payload() payload: { id: string; tenantId: string }) {
    return this.leadsService.remove(payload.id, payload.tenantId);
  }
}
