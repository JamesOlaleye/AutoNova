import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { VehiclesController } from './vehicles.controller';

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
    ]),
  ],
  controllers: [VehiclesController],
})
export class VehiclesModule {}
