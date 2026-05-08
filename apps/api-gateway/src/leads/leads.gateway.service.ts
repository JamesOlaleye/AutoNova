import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LEAD_PATTERNS, SERVICES } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.LEADS) private readonly client: ClientProxy) {
    super();
  }

  create(dto: CreateLeadDto, tenantId: string) {
    return this.send(this.client, LEAD_PATTERNS.CREATE, { ...dto, tenantId });
  }

  findAll(query: LeadQueryDto, tenantId: string) {
    return this.send(this.client, LEAD_PATTERNS.FIND_ALL, { ...query, tenantId });
  }

  findOne(id: string, tenantId: string) {
    return this.send(this.client, LEAD_PATTERNS.FIND_BY_ID, { id, tenantId });
  }

  update(id: string, dto: UpdateLeadDto, tenantId: string) {
    return this.send(this.client, LEAD_PATTERNS.UPDATE, { ...dto, id, tenantId });
  }
}
