import { LeadType } from '@autonova/types';

const ENQUIRY_TYPE_LABEL: Record<LeadType, string> = {
  INQUIRY: 'General Enquiry',
  TEST_DRIVE: 'Test Drive Request',
  TRADE_IN: 'Trade-In',
  FINANCING: 'Financing Enquiry',
};

interface DealerEmailData {
  dealerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  enquiryType: LeadType;
  message?: string;
  vehicleId?: string;
  dashboardUrl: string;
}

export function newLeadDealerTemplate(data: DealerEmailData): { subject: string; html: string } {
  const subject = `New ${ENQUIRY_TYPE_LABEL[data.enquiryType]} from ${data.customerName}`;

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
              <p style="color:#94a3b8;font-size:12px;margin:10px 0 0;">Dealer Hub Notifications</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <h1 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 6px;">You have a new enquiry</h1>
              <p style="color:#64748b;font-size:14px;margin:0 0 28px;">
                A customer is interested in your inventory. Respond promptly to increase your chances of closing.
              </p>

              <!-- Enquiry type badge -->
              <div style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:4px 14px;margin-bottom:24px;">
                <span style="color:#1d4ed8;font-size:13px;font-weight:600;">${ENQUIRY_TYPE_LABEL[data.enquiryType]}</span>
              </div>

              <!-- Customer details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 12px;">Customer Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#64748b;font-size:13px;width:80px;display:inline-block;">Name</span>
                          <span style="color:#0f172a;font-size:13px;font-weight:600;">${data.customerName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#64748b;font-size:13px;width:80px;display:inline-block;">Email</span>
                          <a href="mailto:${data.customerEmail}" style="color:#2563eb;font-size:13px;font-weight:500;text-decoration:none;">${data.customerEmail}</a>
                        </td>
                      </tr>
                      ${data.customerPhone ? `
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#64748b;font-size:13px;width:80px;display:inline-block;">Phone</span>
                          <a href="tel:${data.customerPhone}" style="color:#2563eb;font-size:13px;font-weight:500;text-decoration:none;">${data.customerPhone}</a>
                        </td>
                      </tr>` : ''}
                      ${data.vehicleId ? `
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#64748b;font-size:13px;width:80px;display:inline-block;">Vehicle</span>
                          <span style="color:#0f172a;font-size:13px;">ID: ${data.vehicleId}</span>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${data.message ? `
              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:0 10px 10px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;">Customer Message</p>
                    <p style="color:#334155;font-size:14px;line-height:1.6;margin:0;">${data.message}</p>
                  </td>
                </tr>
              </table>` : ''}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardUrl}"
                       style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      View in Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                This notification was sent by <strong>AutoNova</strong> on behalf of ${data.dealerName}.<br/>
                Manage your notification preferences in your dashboard settings.
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
