import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from '@autonova/database';
import { Order } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createDatabaseConfig([Order], config),
    }),
    OrdersModule,
  ],
})
export class AppModule {}
