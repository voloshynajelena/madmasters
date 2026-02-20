import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendTelegramNotification } from '@/lib/telegram';

// Validation schema
const orderSchema = z.object({
  type: z.enum(['brief', 'calculator', 'contact']),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  message: z.string().optional(),
  subject: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  locale: z.string().default('en'),
  page: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = orderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();

    // Get metadata
    const referrer = request.headers.get('referer') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create message document in messages collection
    const messageRef = db.collection('messages').doc();
    const message = {
      id: messageRef.id,
      source: data.type,
      status: 'new',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      body: data.message || '',
      metadata: data.data || null,
      page: data.page,
      locale: data.locale,
      referrer: referrer || null,
      userAgent: userAgent || null,
      telegramSent: false,
      telegramMessageId: null,
      createdAt: Timestamp.now(),
    };

    await messageRef.set(message);

    // Also save to orders collection for backwards compatibility
    const orderRef = db.collection('orders').doc(messageRef.id);
    const order = {
      id: orderRef.id,
      type: data.type,
      status: 'new',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      data: data.data || null,
      locale: data.locale,
      page: data.page,
      referrer: referrer || null,
      userAgent: userAgent || null,
      createdAt: Timestamp.now(),
    };
    await orderRef.set(order);

    // Send Telegram notification (non-blocking)
    sendTelegramNotification({
      id: messageRef.id,
      source: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      body: data.message || '',
      page: data.page,
      metadata: data.data,
    })
      .then(async result => {
        if (result.success) {
          // Update message with telegram status
          await messageRef.update({
            telegramSent: true,
            telegramMessageId: result.messageId || null,
          });
        }
      })
      .catch(err => {
        console.error('Telegram notification failed:', err);
      });

    return NextResponse.json({
      success: true,
      messageId: messageRef.id,
      orderId: orderRef.id,
    });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
