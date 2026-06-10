import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { Vehicle } from './entities/vehicle.entity';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    ClientsModule.register([{
      name: SERVICES.TENANTS,
      transport: Transport.TCP,
      options: {
        host: process.env.TENANTS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.TENANTS_SERVICE_PORT || '3002'),
      },
    }]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
