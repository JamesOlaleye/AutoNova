import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_PATTERNS, MEDIA_PATTERNS, SERVICES } from '@autonova/types';
import type { OrderDocType } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersGatewayService extends BaseGatewayService {
  constructor(
    @Inject(SERVICES.ORDERS) private readonly client: ClientProxy,
    @Inject(SERVICES.MEDIA) private readonly mediaClient: ClientProxy,
  ) {
    super();
  }

  create(dto: CreateOrderDto, tenantId: string) {
    return this.send(this.client, ORDER_PATTERNS.CREATE, { ...dto, tenantId });
  }

  findAll(query: OrderQueryDto, tenantId: string) {
    return this.send(this.client, ORDER_PATTERNS.FIND_ALL, { ...query, tenantId });
  }

  findOne(id: string, tenantId: string) {
    return this.send(this.client, ORDER_PATTERNS.FIND_BY_ID, { id, tenantId });
  }

  update(id: string, dto: UpdateOrderDto, tenantId: string) {
    return this.send(this.client, ORDER_PATTERNS.UPDATE, { ...dto, id, tenantId });
  }

  async uploadDocument(
    id: string,
    tenantId: string,
    base64: string,
    name: string,
    docType: OrderDocType,
  ) {
    const media = await this.send<{ url: string; publicId: string }>(
      this.mediaClient,
      MEDIA_PATTERNS.UPLOAD,
      { base64, folder: 'documents', tenantId },
    );
    return this.send(this.client, ORDER_PATTERNS.ADD_DOCUMENT, {
      id, tenantId, url: media.url, publicId: media.publicId, name, docType,
    });
  }

  async deleteDocument(id: string, tenantId: string, publicId: string) {
    await this.send(this.mediaClient, MEDIA_PATTERNS.DELETE, { publicId, tenantId });
    return this.send(this.client, ORDER_PATTERNS.REMOVE_DOCUMENT, { id, tenantId, publicId });
  }
}
