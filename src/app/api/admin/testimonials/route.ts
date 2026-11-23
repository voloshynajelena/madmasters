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

const testimonialSchema = z.object({
  status: z.enum(['draft', 'published']),
  order: z.number().default(0),
  locales: z.object({
    en: z.object({ quote: z.string().min(1) }),
    fr: z.object({ quote: z.string() }).optional(),
  }),
  author: z.string().min(1),
  role: z.string(),
  company: z.string(),
  avatar: z.object({
    url: z.string(),
    path: z.string(),
    alt: z.string(),
  }).optional(),
  caseStudyId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db.collection('testimonials').orderBy('order', 'asc');
    if (status === 'draft' || status === 'published') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const validationResult = testimonialSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();
    const docRef = db.collection('testimonials').doc();
    const now = Timestamp.now();

    const testimonial = {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
      updatedBy: user.email || user.uid,
    };

    await docRef.set(testimonial);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      testimonial: {
        ...testimonial,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
