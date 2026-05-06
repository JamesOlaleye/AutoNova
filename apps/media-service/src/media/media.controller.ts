import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MEDIA_PATTERNS } from '@autonova/types';
import { MediaService } from './media.service';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern(MEDIA_PATTERNS.UPLOAD)
  upload(@Payload() payload: { base64: string; folder: string; tenantId: string }) {
    return this.mediaService.upload(payload);
  }

  @MessagePattern(MEDIA_PATTERNS.DELETE)
  delete(@Payload() payload: { publicId: string; tenantId: string }) {
    return this.mediaService.delete(payload.publicId);
  }
}
