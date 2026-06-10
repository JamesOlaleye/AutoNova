import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ORDER_PATTERNS,
  AddOrderDocumentPayload,
  CreateOrderPayload,
  RemoveOrderDocumentPayload,
  UpdateOrderPayload,
} from '@autonova/types';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(ORDER_PATTERNS.CREATE)
  create(@Payload() payload: CreateOrderPayload) {
    return this.ordersService.create(payload);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_BY_ID)
  findById(@Payload() payload: { id: string; tenantId: string }) {
    return this.ordersService.findById(payload.id, payload.tenantId);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ALL)
  findAll(@Payload() payload: { tenantId: string; page?: number; limit?: number }) {
    return this.ordersService.findAll(payload.tenantId, payload.page, payload.limit);
  }

  @MessagePattern(ORDER_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateOrderPayload) {
    return this.ordersService.update(payload);
  }

  @MessagePattern(ORDER_PATTERNS.ADD_DOCUMENT)
  addDocument(@Payload() payload: AddOrderDocumentPayload) {
    return this.ordersService.addDocument(payload);
  }

  @MessagePattern(ORDER_PATTERNS.REMOVE_DOCUMENT)
  removeDocument(@Payload() payload: RemoveOrderDocumentPayload) {
    return this.ordersService.removeDocument(payload);
  }
}
