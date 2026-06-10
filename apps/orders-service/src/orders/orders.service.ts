import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import {
  AddOrderDocumentPayload,
  CreateOrderPayload,
  PaginatedResponse,
  RemoveOrderDocumentPayload,
  UpdateOrderPayload,
} from '@autonova/types';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private readonly orderRepo: Repository<Order>) {}

  async create(payload: CreateOrderPayload): Promise<Order> {
    return this.orderRepo.save(this.orderRepo.create(payload));
  }

  async findById(id: string, tenantId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!order) throw new RpcException({ message: 'Order not found', statusCode: 404 });
    return order;
  }

  async findAll(tenantId: string, page = 1, limit = 20): Promise<PaginatedResponse<Order>> {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(payload: UpdateOrderPayload): Promise<Order> {
    const { id, tenantId, status, ...rest } = payload;
    const updates: any = { ...rest };
    if (status) {
      updates.status = status;
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        updates.closedAt = new Date();
      }
    }
    await this.orderRepo.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async addDocument(payload: AddOrderDocumentPayload): Promise<Order> {
    const order = await this.findById(payload.id, payload.tenantId);
    const existing = order.documents ?? [];
    const doc = {
      url: payload.url,
      publicId: payload.publicId,
      name: payload.name,
      docType: payload.docType,
      uploadedAt: new Date().toISOString(),
    };
    await this.orderRepo.update(
      { id: payload.id, tenantId: payload.tenantId },
      { documents: [...existing, doc] },
    );
    return this.findById(payload.id, payload.tenantId);
  }

  async removeDocument(payload: RemoveOrderDocumentPayload): Promise<Order> {
    const order = await this.findById(payload.id, payload.tenantId);
    const filtered = (order.documents ?? []).filter((d) => d.publicId !== payload.publicId);
    await this.orderRepo.update(
      { id: payload.id, tenantId: payload.tenantId },
      { documents: filtered },
    );
    return this.findById(payload.id, payload.tenantId);
  }
}
