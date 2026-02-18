import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Validation schema
const orderSchema = z.object({
  type: z.enum(['brief', 'calculator', 'contact']),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  message: z.string().optional(),
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

    // Create order document
    const orderRef = db.collection('orders').doc();
    const order = {
      id: orderRef.id,
      ...data,
      status: 'new',
      referrer,
      userAgent,
      createdAt: Timestamp.now(),
    };

    await orderRef.set(order);

    // TODO: Send email notification (OPTIONAL)
    // await sendNotificationEmail(order);

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
