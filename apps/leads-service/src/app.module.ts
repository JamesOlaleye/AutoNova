import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from '@autonova/database';
import { Lead } from './leads/entities/lead.entity';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(createDatabaseConfig([Lead])),
    LeadsModule,
  ],
})
export class AppModule {}
