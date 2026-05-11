import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICES, VEHICLE_PATTERNS, MEDIA_PATTERNS } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

@Injectable()
export class VehiclesGatewayService extends BaseGatewayService {
  constructor(
    @Inject(SERVICES.VEHICLES) private readonly client: ClientProxy,
    @Inject(SERVICES.MEDIA) private readonly mediaClient: ClientProxy,
  ) {
    super();
  }

  findAll(query: VehicleQueryDto, tenantId: string) {
    return this.send(this.client, VEHICLE_PATTERNS.FIND_ALL, { ...query, tenantId });
  }

  search(query: VehicleQueryDto, tenantId: string) {
    return this.send(this.client, VEHICLE_PATTERNS.SEARCH, { ...query, tenantId });
  }

  findOne(id: string, tenantId: string) {
    return this.send(this.client, VEHICLE_PATTERNS.FIND_BY_ID, { id, tenantId });
  }

  create(dto: CreateVehicleDto, tenantId: string) {
    return this.send(this.client, VEHICLE_PATTERNS.CREATE, { ...dto, tenantId });
  }

  update(id: string, dto: UpdateVehicleDto, tenantId: string) {
    return this.send(this.client, VEHICLE_PATTERNS.UPDATE, { ...dto, id, tenantId });
  }

  remove(id: string, tenantId: string) {
    return this.send(this.client, VEHICLE_PATTERNS.DELETE, { id, tenantId });
  }

  async uploadImage(id: string, tenantId: string, base64: string) {
    const media = await this.send<{ url: string; publicId: string }>(
      this.mediaClient,
      MEDIA_PATTERNS.UPLOAD,
      { base64, folder: 'vehicles', tenantId },
    );
    return this.send(this.client, VEHICLE_PATTERNS.ADD_IMAGE, {
      id, tenantId, url: media.url, publicId: media.publicId,
    });
  }

  async deleteImage(id: string, tenantId: string, publicId: string, url: string) {
    await this.send(this.mediaClient, MEDIA_PATTERNS.DELETE, { publicId, tenantId });
    return this.send(this.client, VEHICLE_PATTERNS.REMOVE_IMAGE, {
      id, tenantId, url, publicId,
    });
  }
}
