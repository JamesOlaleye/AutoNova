import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);

  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(payload: { base64: string; folder: string; tenantId: string }) {
    // TODO: upload to Cloudinary
    // const result = await cloudinary.uploader.upload(payload.base64, { folder: `autonova/${payload.tenantId}/${payload.folder}` });
    // return { url: result.secure_url, publicId: result.public_id };
    this.logger.log(`[UPLOAD] folder=${payload.folder} tenant=${payload.tenantId}`);
    return { url: '', publicId: '' };
  }

  async delete(publicId: string) {
    // TODO: await cloudinary.uploader.destroy(publicId);
    this.logger.log(`[DELETE] publicId=${publicId}`);
    return { deleted: true };
  }
}
