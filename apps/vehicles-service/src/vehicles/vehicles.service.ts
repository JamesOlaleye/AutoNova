import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Vehicle } from './entities/vehicle.entity';
import {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleSearchPayload,
  AddVehicleImagePayload,
  RemoveVehicleImagePayload,
  PaginatedResponse,
} from '@autonova/types';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(payload: CreateVehiclePayload): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(payload);
    return this.vehicleRepository.save(vehicle);
  }

  async findById(id: string, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id, tenantId },
    });
    if (!vehicle) {
      throw new RpcException({ statusCode: 404, message: 'Vehicle not found' });
    }
    return vehicle;
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Vehicle>> {
    const [data, total] = await this.vehicleRepository.findAndCount({
      where: { tenantId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(payload: VehicleSearchPayload): Promise<PaginatedResponse<Vehicle>> {
    const {
      tenantId,
      make,
      model,
      yearMin,
      yearMax,
      priceMin,
      priceMax,
      condition,
      transmission,
      fuelType,
      status,
      page = 1,
      limit = 20,
    } = payload;

    const where: FindOptionsWhere<Vehicle> = { tenantId };

    if (make) where.make = make;
    if (model) where.model = model;
    if (condition) where.condition = condition;
    if (transmission) where.transmission = transmission;
    if (fuelType) where.fuelType = fuelType;
    if (status) where.status = status;
    if (yearMin !== undefined && yearMax !== undefined) {
      where.year = Between(yearMin, yearMax);
    }
    if (priceMin !== undefined && priceMax !== undefined) {
      where.price = Between(priceMin, priceMax);
    }

    const [data, total] = await this.vehicleRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(payload: UpdateVehiclePayload): Promise<Vehicle> {
    const { id, tenantId, ...updateData } = payload;
    await this.vehicleRepository.update({ id, tenantId }, updateData);
    return this.findById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    await this.findById(id, tenantId);
    await this.vehicleRepository.update({ id, tenantId }, { status: 'DRAFT' });
    return { message: 'Vehicle removed successfully' };
  }

  async addImage(payload: AddVehicleImagePayload): Promise<Vehicle> {
    const vehicle = await this.findById(payload.id, payload.tenantId);
    const current = vehicle.images ?? [];
    await this.vehicleRepository.update(
      { id: payload.id, tenantId: payload.tenantId },
      { images: [...current, payload.url] },
    );
    return this.findById(payload.id, payload.tenantId);
  }

  async removeImage(payload: RemoveVehicleImagePayload): Promise<Vehicle> {
    const vehicle = await this.findById(payload.id, payload.tenantId);
    const updated = (vehicle.images ?? []).filter((url) => url !== payload.url);
    await this.vehicleRepository.update(
      { id: payload.id, tenantId: payload.tenantId },
      { images: updated },
    );
    return this.findById(payload.id, payload.tenantId);
  }
}
