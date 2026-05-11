import { LeadType } from '@autonova/types';

const ENQUIRY_TYPE_LABEL: Record<LeadType, string> = {
  INQUIRY: 'General Enquiry',
  TEST_DRIVE: 'Test Drive Request',
  TRADE_IN: 'Trade-In',
  FINANCING: 'Financing Enquiry',
};

interface ConfirmationEmailData {
  customerName: string;
  dealerName: string;
  enquiryType: LeadType;
}

export function enquiryConfirmationTemplate(data: ConfirmationEmailData): { subject: string; html: string } {
  const subject = `We've received your ${ENQUIRY_TYPE_LABEL[data.enquiryType].toLowerCase()} — ${data.dealerName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:#0F172A;border-radius:12px 12px 0 0;padding:28px 36px;text-align:center;">
              <span style="display:inline-block;background:#2563EB;border-radius:8px;padding:8px 14px;">
                <span style="color:#fff;font-size:16px;font-weight:700;letter-spacing:-0.3px;">AutoNova</span>
              </span>
              <p style="color:#94a3b8;font-size:12px;margin:10px 0 0;">${data.dealerName}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Success icon -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;">
                      <span style="font-size:26px;">✓</span>
                    </div>
                  </td>
                </tr>
              </table>

              <h1 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 8px;text-align:center;">
                Enquiry received!
              </h1>
              <p style="color:#64748b;font-size:15px;line-height:1.6;text-align:center;margin:0 0 28px;">
                Hi ${data.customerName}, thank you for your <strong>${ENQUIRY_TYPE_LABEL[data.enquiryType].toLowerCase()}</strong>.<br/>
                The team at <strong>${data.dealerName}</strong> will be in touch with you shortly.
              </p>

              <!-- What to expect -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 16px;">What happens next</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;background:#2563eb;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;margin-right:10px;">1</span>
                          <span style="color:#334155;font-size:13px;">Our sales team reviews your enquiry</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;background:#2563eb;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;margin-right:10px;">2</span>
                          <span style="color:#334155;font-size:13px;">We contact you within 24 hours</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;background:#2563eb;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;margin-right:10px;">3</span>
                          <span style="color:#334155;font-size:13px;">We answer your questions and arrange a viewing</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
                Have questions? Reply directly to this email or contact us on WhatsApp.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                Powered by <strong>AutoNova</strong> — The platform for modern car dealerships.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
