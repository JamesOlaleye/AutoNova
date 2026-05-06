import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { LeadsController } from './leads.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.LEADS,
        transport: Transport.TCP,
        options: {
          host: process.env.LEADS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.LEADS_SERVICE_PORT || '3005'),
        },
      },
    ]),
  ],
  controllers: [LeadsController],
})
export class LeadsModule {}
