import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '@autonova/types';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([{
      name: SERVICES.TENANTS,
      transport: Transport.TCP,
      options: {
        host: process.env.TENANTS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.TENANTS_SERVICE_PORT || '3002'),
      },
    }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
