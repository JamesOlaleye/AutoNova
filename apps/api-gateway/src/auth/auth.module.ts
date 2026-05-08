import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { AuthController } from './auth.controller';
import { AuthGatewayService } from './auth.gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.AUTH,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.AUTH_SERVICE_PORT || '3001'),
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthGatewayService],
})
export class AuthModule {}
