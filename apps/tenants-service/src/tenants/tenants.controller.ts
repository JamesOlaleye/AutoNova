import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TENANT_PATTERNS, CreateTenantPayload, UpdateTenantPayload } from '@autonova/types';
import { TenantsService } from './tenants.service';

@Controller()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @MessagePattern(TENANT_PATTERNS.CREATE)
  create(@Payload() payload: CreateTenantPayload) {
    return this.tenantsService.create(payload);
  }

  @MessagePattern(TENANT_PATTERNS.FIND_BY_ID)
  findById(@Payload() payload: { id: string }) {
    return this.tenantsService.findById(payload.id);
  }

  @MessagePattern(TENANT_PATTERNS.FIND_BY_SLUG)
  findBySlug(@Payload() payload: { slug: string }) {
    return this.tenantsService.findBySlug(payload.slug);
  }

  @MessagePattern(TENANT_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateTenantPayload) {
    return this.tenantsService.update(payload);
  }

  @MessagePattern(TENANT_PATTERNS.GET_ALL)
  findAll() {
    return this.tenantsService.findAll();
  }

  @MessagePattern(TENANT_PATTERNS.FIND_PUBLIC)
  findPublic(@Payload() payload: { slug: string }) {
    return this.tenantsService.findPublic(payload.slug);
  }

  @MessagePattern(TENANT_PATTERNS.GET_PLAN)
  getPlan(@Payload() payload: { tenantId: string }) {
    return this.tenantsService.getPlan(payload.tenantId);
  }

  @MessagePattern(TENANT_PATTERNS.DEACTIVATE)
  deactivate(@Payload() payload: { id: string }) {
    return this.tenantsService.deactivate(payload.id);
  }
}
