import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const auth = getAdminAuth();
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

const promotionSchema = z.object({
  status: z.enum(['draft', 'published']),
  locales: z.object({
    en: z.object({
      title: z.string().min(1),
      description: z.string(),
      ctaText: z.string(),
    }),
    fr: z.object({
      title: z.string(),
      description: z.string(),
      ctaText: z.string(),
    }).optional(),
  }),
  ctaUrl: z.string().url().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db.collection('promotions').orderBy('createdAt', 'desc');
    if (status === 'draft' || status === 'published') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const promotions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate?.()?.toISOString() || null,
      endDate: doc.data().endDate?.toDate?.()?.toISOString() || null,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const validationResult = promotionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();
    const docRef = db.collection('promotions').doc();
    const now = Timestamp.now();

    const promotion = {
      id: docRef.id,
      ...data,
      ctaUrl: data.ctaUrl || null,
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
      createdAt: now,
      updatedAt: now,
      updatedBy: user.email || user.uid,
    };

    await docRef.set(promotion);

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
