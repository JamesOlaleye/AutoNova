import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: parseInt(process.env.PAYMENTS_SERVICE_PORT || '3010') },
  });
  await app.listen();
  console.log('[Payments Service] Listening on TCP port', process.env.PAYMENTS_SERVICE_PORT || 3010);
}
bootstrap();
