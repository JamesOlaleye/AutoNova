import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(payload: { to: string; subject: string; html: string; tenantId: string }) {
    // TODO: integrate Resend — const resend = new Resend(process.env.RESEND_API_KEY)
    this.logger.log(`[EMAIL] to=${payload.to} subject="${payload.subject}"`);
    return { queued: true, channel: 'email' };
  }

  async sendSms(payload: { to: string; body: string; tenantId: string }) {
    // TODO: integrate Twilio — client.messages.create(...)
    this.logger.log(`[SMS] to=${payload.to}`);
    return { queued: true, channel: 'sms' };
  }

  async sendWhatsapp(payload: { to: string; body: string; tenantId: string }) {
    // TODO: integrate Twilio WhatsApp — 'whatsapp:+...'
    this.logger.log(`[WHATSAPP] to=${payload.to}`);
    return { queued: true, channel: 'whatsapp' };
  }
}
