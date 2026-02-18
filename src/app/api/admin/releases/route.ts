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

const releaseSchema = z.object({
  status: z.enum(['draft', 'published']),
  type: z.enum(['announcement', 'update', 'launch']),
  locales: z.object({
    en: z.object({
      title: z.string().min(1),
      body: z.string(),
    }),
    fr: z.object({
      title: z.string(),
      body: z.string(),
    }).optional(),
  }),
  date: z.string(),
});

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db.collection('releases').orderBy('date', 'desc');
    if (status === 'draft' || status === 'published') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const releases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || null,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ releases });
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const validationResult = releaseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();
    const docRef = db.collection('releases').doc();
    const now = Timestamp.now();

    const release = {
      id: docRef.id,
      ...data,
      date: Timestamp.fromDate(new Date(data.date)),
      createdAt: now,
      updatedAt: now,
      updatedBy: user.email || user.uid,
    };

    await docRef.set(release);

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error creating release:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
