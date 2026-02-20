/**
 * Telegram Bot Integration
 */

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

export interface MessageNotificationData {
  id: string;
  source: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  body: string;
  page?: string;
  metadata?: Record<string, unknown>;
}

const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function sendTelegramNotification(data: MessageNotificationData): Promise<{ success: boolean; messageId?: number }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram credentials not configured, skipping notification');
    console.warn('TELEGRAM_BOT_TOKEN:', botToken ? 'set' : 'NOT SET');
    console.warn('TELEGRAM_CHAT_ID:', chatId ? 'set' : 'NOT SET');
    return { success: false };
  }

  const sourceEmoji: Record<string, string> = {
    contact: '💬',
    brief: '📋',
    calculator: '🧮',
    telegram: '📱',
    other: '📨',
  };

  const sourceLabels: Record<string, string> = {
    contact: 'Contact Form',
    brief: 'Project Brief',
    calculator: 'Quote Calculator',
    telegram: 'Telegram',
    other: 'Other',
  };

  const emoji = sourceEmoji[data.source] || '📨';
  const sourceLabel = sourceLabels[data.source] || data.source;

  // Build plain text message
  const lines = [
    `${emoji} New ${sourceLabel} Message`,
    '',
    `👤 From: ${data.name}`,
    `📧 Email: ${data.email}`,
  ];

  if (data.phone) {
    lines.push(`📞 Phone: ${data.phone}`);
  }

  if (data.subject) {
    lines.push(`📝 Subject: ${data.subject}`);
  }

  lines.push('');
  lines.push('Message:');
  lines.push(data.body || '(no message)');

  if (data.metadata && Object.keys(data.metadata).length > 0) {
    lines.push('');
    lines.push('Additional Info:');
    Object.entries(data.metadata).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        const formattedValue = Array.isArray(value) ? value.join(', ') : String(value);
        lines.push(`  ${formattedKey}: ${formattedValue}`);
      }
    });
  }

  if (data.page) {
    lines.push('');
    lines.push(`🔗 Page: ${data.page}`);
  }

  lines.push('');
  lines.push(`🆔 ${data.id}`);

  const text = lines.join('\n');

  try {
    console.log('Sending Telegram notification to chat:', chatId);

    const response = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const result: TelegramResponse = await response.json();

    if (result.ok && result.result) {
      console.log(`Telegram notification sent for message ${data.id}, message_id: ${result.result.message_id}`);
      return { success: true, messageId: result.result.message_id };
    } else {
      console.error('Telegram API error:', result.description);
      return { success: false };
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return { success: false };
  }
}
