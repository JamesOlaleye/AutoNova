import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_PATTERNS, SERVICES } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.ORDERS) private readonly client: ClientProxy) {
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
}
