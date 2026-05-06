import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.TENANTS,
        transport: Transport.TCP,
        options: {
          host: process.env.TENANTS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.TENANTS_SERVICE_PORT || '3002'),
        },
      },
    ]),
  ],
  controllers: [TenantsController],
})
export class TenantsModule {}
