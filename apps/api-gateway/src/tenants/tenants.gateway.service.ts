import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICES, TENANT_PATTERNS } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.TENANTS) private readonly client: ClientProxy) {
    super();
  }

  create(dto: CreateTenantDto) {
    return this.send(this.client, TENANT_PATTERNS.CREATE, dto);
  }

  findOne(id: string) {
    return this.send(this.client, TENANT_PATTERNS.FIND_BY_ID, { id });
  }

  findAll() {
    return this.send(this.client, TENANT_PATTERNS.GET_ALL, {});
  }

  update(id: string, dto: UpdateTenantDto) {
    return this.send(this.client, TENANT_PATTERNS.UPDATE, { ...dto, id });
  }
}
