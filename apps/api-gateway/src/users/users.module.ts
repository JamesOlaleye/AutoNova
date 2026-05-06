import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.USERS,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USERS_SERVICE_PORT || '3003'),
        },
      },
    ]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
