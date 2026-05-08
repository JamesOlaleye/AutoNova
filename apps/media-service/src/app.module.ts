import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaModule } from './media/media.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
    }), MediaModule],
})
export class AppModule {}
