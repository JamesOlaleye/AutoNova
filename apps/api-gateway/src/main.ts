import { exec } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new RpcExceptionFilter());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');

  const apiVersion = 'v1';
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AutoNova API')
    .setDescription('Multi-tenant SaaS platform for car dealerships.')
    .setVersion(apiVersion)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const swaggerPath = `api/${apiVersion}/swagger`;
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'AutoNova API Docs',
    customCss: 'html { color-scheme: light !important; }',
  });

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);

  const docsUrl = `http://localhost:${port}/${swaggerPath}`;
  console.log(`[API Gateway] Running on http://localhost:${port}/api/${apiVersion}`);
  console.log(`[API Docs]    ${docsUrl}`);

  if (process.env.NODE_ENV !== 'production') {
    const openCmd = process.platform === 'win32'
      ? `start "" "${docsUrl}"`
      : process.platform === 'darwin'
      ? `open "${docsUrl}"`
      : `xdg-open "${docsUrl}"`;
    exec(openCmd);
  }
}
bootstrap();
