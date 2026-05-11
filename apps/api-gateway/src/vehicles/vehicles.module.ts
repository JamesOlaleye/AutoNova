import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { VehiclesController } from './vehicles.controller';
import { VehiclesGatewayService } from './vehicles.gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.VEHICLES,
        transport: Transport.TCP,
        options: {
          host: process.env.VEHICLES_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.VEHICLES_SERVICE_PORT || '3004'),
        },
      },
      {
        name: SERVICES.MEDIA,
        transport: Transport.TCP,
        options: {
          host: process.env.MEDIA_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.MEDIA_SERVICE_PORT || '3008'),
        },
      },
    ]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesGatewayService],
})
export class VehiclesModule {}
