import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SERVICES } from '@autonova/types';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Subscription } from './entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
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
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
