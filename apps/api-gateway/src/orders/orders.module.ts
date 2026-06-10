import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { OrdersController } from './orders.controller';
import { OrdersGatewayService } from './orders.gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.ORDERS,
        transport: Transport.TCP,
        options: {
          host: process.env.ORDERS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.ORDERS_SERVICE_PORT || '3006'),
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
  controllers: [OrdersController],
  providers: [OrdersGatewayService],
})
export class OrdersModule {}
