import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS } from '@autonova/types';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern(NOTIFICATION_PATTERNS.SEND_EMAIL)
  sendEmail(@Payload() payload: { to: string; subject: string; html: string; tenantId: string }) {
    return this.notificationsService.sendEmail(payload);
  }

  @MessagePattern(NOTIFICATION_PATTERNS.SEND_SMS)
  sendSms(@Payload() payload: { to: string; body: string; tenantId: string }) {
    return this.notificationsService.sendSms(payload);
  }

  @MessagePattern(NOTIFICATION_PATTERNS.SEND_WHATSAPP)
  sendWhatsapp(@Payload() payload: { to: string; body: string; tenantId: string }) {
    return this.notificationsService.sendWhatsapp(payload);
  }
}
