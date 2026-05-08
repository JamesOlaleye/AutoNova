import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { PaymentsController } from './payments.controller';
import { PaymentsGatewayService } from './payments.gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.PAYMENTS,
        transport: Transport.TCP,
        options: {
          host: process.env.PAYMENTS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PAYMENTS_SERVICE_PORT || '3010'),
        },
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsGatewayService],
})
export class PaymentsModule {}
