import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Resend } from 'resend';
import Twilio from 'twilio';
import {
  SERVICES,
  TENANT_PATTERNS,
  USER_PATTERNS,
  NotifyNewLeadPayload,
  NotifyLeadAssignedPayload,
  TenantResponse,
  UserResponse,
} from '@autonova/types';
import { newLeadDealerTemplate } from './templates/new-lead-dealer.template';
import { enquiryConfirmationTemplate } from './templates/enquiry-confirmation.template';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resend: Resend;
  private readonly twilio: ReturnType<typeof Twilio> | null;
  private readonly fromEmail: string;
  private readonly twilioPhone: string;
  private readonly twilioWhatsApp: string;
  private readonly dashboardUrl: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(SERVICES.TENANTS) private readonly tenantsClient: ClientProxy,
    @Inject(SERVICES.USERS) private readonly usersClient: ClientProxy,
  ) {
    this.fromEmail =
      config.get('RESEND_FROM_EMAIL') ?? 'notifications@autonova.io';
    this.dashboardUrl =
      config.get('DASHBOARD_URL') ?? 'http://localhost:3101';
    this.twilioPhone = config.get('TWILIO_PHONE_NUMBER') ?? '';
    this.twilioWhatsApp = config.get('TWILIO_WHATSAPP_NUMBER') ?? '';

    const resendKey = config.get<string>('RESEND_API_KEY') ?? '';
    this.resend = new Resend(resendKey);

    const twilioSid = config.get<string>('TWILIO_ACCOUNT_SID') ?? '';
    const twilioToken = config.get<string>('TWILIO_AUTH_TOKEN') ?? '';
    const twilioIsPlaceholder =
      twilioSid.includes('placeholder') || twilioToken.includes('placeholder');

    this.twilio = twilioIsPlaceholder ? null : Twilio(twilioSid, twilioToken);

    if (twilioIsPlaceholder) {
      this.logger.warn('Twilio credentials are placeholders — SMS/WhatsApp disabled until real keys are set');
    }
  }

  async sendEmail(payload: {
    to: string;
    subject: string;
    html: string;
    tenantId: string;
  }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      this.logger.log(`[EMAIL] sent to=${payload.to} subject="${payload.subject}"`);
      return { sent: true, channel: 'email' };
    } catch (err: any) {
      this.logger.error(`[EMAIL] failed to=${payload.to}: ${err?.message}`);
      return { sent: false, channel: 'email', error: err?.message };
    }
  }

  async sendSms(payload: { to: string; body: string; tenantId: string }) {
    if (!this.twilio) {
      this.logger.warn('[SMS] Twilio not configured — skipping');
      return { sent: false, channel: 'sms' };
    }
    try {
      await this.twilio.messages.create({
        from: this.twilioPhone,
        to: payload.to,
        body: payload.body,
      });
      this.logger.log(`[SMS] sent to=${payload.to}`);
      return { sent: true, channel: 'sms' };
    } catch (err: any) {
      this.logger.error(`[SMS] failed to=${payload.to}: ${err?.message}`);
      return { sent: false, channel: 'sms', error: err?.message };
    }
  }

  async sendWhatsapp(payload: { to: string; body: string; tenantId: string }) {
    if (!this.twilio) {
      this.logger.warn('[WHATSAPP] Twilio not configured — skipping');
      return { sent: false, channel: 'whatsapp' };
    }
    try {
      await this.twilio.messages.create({
        from: `whatsapp:${this.twilioWhatsApp}`,
        to: `whatsapp:${payload.to}`,
        body: payload.body,
      });
      this.logger.log(`[WHATSAPP] sent to=${payload.to}`);
      return { sent: true, channel: 'whatsapp' };
    } catch (err: any) {
      this.logger.error(`[WHATSAPP] failed to=${payload.to}: ${err?.message}`);
      return { sent: false, channel: 'whatsapp', error: err?.message };
    }
  }

  async notifyNewLead(payload: NotifyNewLeadPayload): Promise<void> {
    // Fetch tenant to get dealer name + contact info
    let tenant: TenantResponse | null = null;
    try {
      tenant = await firstValueFrom(
        this.tenantsClient.send<TenantResponse>(
          TENANT_PATTERNS.FIND_BY_ID,
          { id: payload.tenantId },
        ),
      );
    } catch (err: any) {
      this.logger.error(
        `[NOTIFY_NEW_LEAD] could not fetch tenant ${payload.tenantId}: ${err?.message}`,
      );
    }

    const dealerName = tenant?.name ?? 'AutoNova Dealer';
    const dealerEmail = tenant?.email;

    // 1 — Email dealer
    if (dealerEmail) {
      const { subject, html } = newLeadDealerTemplate({
        dealerName,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        enquiryType: payload.enquiryType,
        message: payload.message,
        vehicleId: payload.vehicleId,
        dashboardUrl: `${this.dashboardUrl}/leads`,
      });
      await this.sendEmail({ to: dealerEmail, subject, html, tenantId: payload.tenantId });
    } else {
      this.logger.warn(
        `[NOTIFY_NEW_LEAD] no dealer email for tenant ${payload.tenantId} — skipping dealer email`,
      );
    }

    // 2 — Confirmation email to customer
    const { subject: confSubject, html: confHtml } = enquiryConfirmationTemplate({
      customerName: payload.customerName,
      dealerName,
      enquiryType: payload.enquiryType,
    });
    await this.sendEmail({
      to: payload.customerEmail,
      subject: confSubject,
      html: confHtml,
      tenantId: payload.tenantId,
    });

    // 3 — SMS alert to dealer if phone number is on file
    if (tenant?.phone) {
      const type = payload.enquiryType.toLowerCase().replace('_', ' ');
      await this.sendSms({
        to: tenant.phone,
        body: `AutoNova: New ${type} from ${payload.customerName} (${payload.customerEmail}). Log in to respond: ${this.dashboardUrl}/leads`,
        tenantId: payload.tenantId,
      });
    }

    this.logger.log(
      `[NOTIFY_NEW_LEAD] completed lead=${payload.leadId} tenant=${payload.tenantId}`,
    );
  }

  async notifyLeadAssigned(payload: NotifyLeadAssignedPayload): Promise<void> {
    // Fetch the assigned agent's profile to get their phone number
    let agent: UserResponse | null = null;
    try {
      agent = await firstValueFrom(
        this.usersClient.send<UserResponse>(
          USER_PATTERNS.FIND_BY_ID,
          { id: payload.assignedToUserId, tenantId: payload.tenantId },
        ),
      );
    } catch (err: any) {
      this.logger.error(
        `[NOTIFY_LEAD_ASSIGNED] could not fetch user ${payload.assignedToUserId}: ${err?.message}`,
      );
    }

    if (!agent?.phone) {
      this.logger.warn(
        `[NOTIFY_LEAD_ASSIGNED] agent ${payload.assignedToUserId} has no phone — skipping SMS`,
      );
      return;
    }

    const type = payload.enquiryType.toLowerCase().replace('_', ' ');
    await this.sendSms({
      to: agent.phone,
      body: `AutoNova: You have been assigned a new ${type} from ${payload.customerName}. Log in to respond: ${this.dashboardUrl}/leads`,
      tenantId: payload.tenantId,
    });

    this.logger.log(
      `[NOTIFY_LEAD_ASSIGNED] SMS sent to agent=${agent.email} lead=${payload.leadId}`,
    );
  }
}
