import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from '@autonova/database';
import { Lead } from './leads/entities/lead.entity';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createDatabaseConfig([Lead], config),
    }),
    LeadsModule,
  ],
})
export class AppModule {}
