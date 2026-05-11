import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SERVICES } from '@autonova/types';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.TENANTS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('TENANTS_SERVICE_HOST') || 'localhost',
            port: parseInt(config.get('TENANTS_SERVICE_PORT') || '3002'),
          },
        }),
      },
      {
        name: SERVICES.USERS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('USERS_SERVICE_HOST') || 'localhost',
            port: parseInt(config.get('USERS_SERVICE_PORT') || '3003'),
          },
        }),
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
