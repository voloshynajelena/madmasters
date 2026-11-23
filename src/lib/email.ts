import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface OrderNotificationData {
  id: string;
  type: 'brief' | 'calculator' | 'contact';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  data?: Record<string, unknown>;
  locale: string;
  page: string;
}

const NOTIFICATION_EMAIL = 'madmweb@gmail.com';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@madmasters.io';

export async function sendOrderNotificationEmail(order: OrderNotificationData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not set, skipping email notification');
    return false;
  }

  const typeLabels: Record<string, string> = {
    brief: 'Project Brief',
    calculator: 'Quote Calculator',
    contact: 'Contact Form',
  };

  const subject = `New ${typeLabels[order.type] || 'Form'} Submission from ${order.name}`;

  // Format additional data if present
  let additionalDataHtml = '';
  if (order.data && Object.keys(order.data).length > 0) {
    additionalDataHtml = `
      <h3 style="color: #333; margin-top: 24px;">Additional Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${Object.entries(order.data)
          .map(
            ([key, value]) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">${formatKey(key)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatValue(value)}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 16px; }
        .label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
        .value { color: #333; }
        .message-box { background: white; padding: 16px; border-radius: 4px; border-left: 4px solid #667eea; margin-top: 16px; }
        .footer { text-align: center; margin-top: 24px; color: #888; font-size: 12px; }
        .badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">New ${typeLabels[order.type] || 'Form'} Submission</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">From ${order.page}</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${escapeHtml(order.name)}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></div>
          </div>
          ${
            order.phone
              ? `
          <div class="field">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a></div>
          </div>
          `
              : ''
          }
          ${
            order.message
              ? `
          <div class="message-box">
            <div class="label">Message</div>
            <div class="value">${escapeHtml(order.message).replace(/\n/g, '<br>')}</div>
          </div>
          `
              : ''
          }
          ${additionalDataHtml}
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
            <span class="badge">${order.type.toUpperCase()}</span>
            <span style="margin-left: 8px; color: #888; font-size: 12px;">Order ID: ${order.id}</span>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Mad Masters website.</p>
          <p>View all orders in the <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://madmasters.io'}/admin/orders">Admin Panel</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New ${typeLabels[order.type] || 'Form'} Submission

Name: ${order.name}
Email: ${order.email}
${order.phone ? `Phone: ${order.phone}` : ''}
${order.message ? `Message: ${order.message}` : ''}

Type: ${order.type}
Page: ${order.page}
Order ID: ${order.id}
  `.trim();

  try {
    await sgMail.send({
      to: NOTIFICATION_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: 'Mad Masters Website',
      },
      replyTo: order.email,
      subject,
      text,
      html,
    });
    console.log(`Email notification sent for order ${order.id}`);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
