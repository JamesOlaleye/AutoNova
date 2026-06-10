import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SERVICES } from '@autonova/types';
import { Tenant } from './entities/tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    ClientsModule.registerAsync([
      {
        name: SERVICES.PAYMENTS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('PAYMENTS_SERVICE_HOST') || 'localhost',
            port: parseInt(config.get('PAYMENTS_SERVICE_PORT') || '3010'),
          },
        }),
      },
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
