import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VehiclesService } from './vehicles.service';
import { VEHICLE_PATTERNS } from '@autonova/types';
import {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleSearchPayload,
  AddVehicleImagePayload,
  RemoveVehicleImagePayload,
} from '@autonova/types';

@Controller()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @MessagePattern(VEHICLE_PATTERNS.CREATE)
  create(@Payload() payload: CreateVehiclePayload) {
    return this.vehiclesService.create(payload);
  }

  @MessagePattern(VEHICLE_PATTERNS.FIND_BY_ID)
  findById(@Payload() payload: { id: string; tenantId: string }) {
    return this.vehiclesService.findById(payload.id, payload.tenantId);
  }

  @MessagePattern(VEHICLE_PATTERNS.FIND_ALL)
  findAll(@Payload() payload: { tenantId: string; page?: number; limit?: number }) {
    return this.vehiclesService.findAll(payload.tenantId, payload.page, payload.limit);
  }

  @MessagePattern(VEHICLE_PATTERNS.SEARCH)
  search(@Payload() payload: VehicleSearchPayload) {
    return this.vehiclesService.search(payload);
  }

  @MessagePattern(VEHICLE_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateVehiclePayload) {
    return this.vehiclesService.update(payload);
  }

  @MessagePattern(VEHICLE_PATTERNS.DELETE)
  remove(@Payload() payload: { id: string; tenantId: string }) {
    return this.vehiclesService.remove(payload.id, payload.tenantId);
  }

  @MessagePattern(VEHICLE_PATTERNS.ADD_IMAGE)
  addImage(@Payload() payload: AddVehicleImagePayload) {
    return this.vehiclesService.addImage(payload);
  }

  @MessagePattern(VEHICLE_PATTERNS.REMOVE_IMAGE)
  removeImage(@Payload() payload: RemoveVehicleImagePayload) {
    return this.vehiclesService.removeImage(payload);
  }
}
