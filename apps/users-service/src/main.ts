import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: parseInt(process.env.USERS_SERVICE_PORT || '3003') },
  });
  await app.listen();
  console.log('[Users Service] Listening on TCP port', process.env.USERS_SERVICE_PORT || 3003);
}
bootstrap();
