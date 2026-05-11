import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS, NotifyNewLeadPayload, NotifyLeadAssignedPayload } from '@autonova/types';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Request-response: callers await a result
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

  // Fire-and-forget events: callers use emit(), never await a response
  @EventPattern(NOTIFICATION_PATTERNS.NOTIFY_NEW_LEAD)
  notifyNewLead(@Payload() payload: NotifyNewLeadPayload) {
    return this.notificationsService.notifyNewLead(payload);
  }

  @EventPattern(NOTIFICATION_PATTERNS.NOTIFY_LEAD_ASSIGNED)
  notifyLeadAssigned(@Payload() payload: NotifyLeadAssignedPayload) {
    return this.notificationsService.notifyLeadAssigned(payload);
  }
}
