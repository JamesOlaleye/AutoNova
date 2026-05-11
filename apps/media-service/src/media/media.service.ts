import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);
  private isConfigured = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY') ?? '';
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET') ?? '';

    const isPlaceholder =
      cloudName.includes('placeholder') ||
      apiKey === '000000000000000' ||
      apiSecret.includes('placeholder');

    if (isPlaceholder) {
      this.logger.warn(
        'Cloudinary credentials are placeholders — uploads will be skipped until real keys are set',
      );
      return;
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    this.isConfigured = true;
    this.logger.log(`Cloudinary configured for cloud: ${cloudName}`);
  }

  async upload(payload: {
    base64: string;
    folder: string;
    tenantId: string;
  }): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured) {
      this.logger.warn('[UPLOAD] Cloudinary not configured — returning placeholder');
      return {
        url: 'https://placehold.co/800x600/e2e8f0/94a3b8?text=No+Image',
        publicId: `placeholder_${Date.now()}`,
      };
    }

    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(payload.base64, {
        folder: `autonova/${payload.tenantId}/${payload.folder}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });
      this.logger.log(
        `[UPLOAD] success publicId=${result.public_id} tenant=${payload.tenantId}`,
      );
      return { url: result.secure_url, publicId: result.public_id };
    } catch (err: any) {
      this.logger.error(`[UPLOAD] failed tenant=${payload.tenantId}: ${err?.message}`);
      throw err;
    }
  }

  async delete(publicId: string): Promise<{ deleted: boolean }> {
    if (!this.isConfigured) {
      this.logger.warn(`[DELETE] Cloudinary not configured — skipping delete for ${publicId}`);
      return { deleted: true };
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`[DELETE] success publicId=${publicId}`);
      return { deleted: true };
    } catch (err: any) {
      this.logger.error(`[DELETE] failed publicId=${publicId}: ${err?.message}`);
      throw err;
    }
  }
}
