import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: parseInt(process.env.MEDIA_SERVICE_PORT || '3008') },
  });
  await app.listen();
  console.log('[Media Service] Listening on TCP port', process.env.MEDIA_SERVICE_PORT || 3008);
}
bootstrap();
