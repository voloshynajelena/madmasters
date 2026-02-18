import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Verify admin auth
async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

// Validation schema for case study
const localizedContentSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  challenge: z.string(),
  solution: z.string(),
  results: z.string(),
});

const mediaRefSchema = z.object({
  url: z.string().url(),
  path: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const seoMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional(),
});

const caseStudySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  status: z.enum(['draft', 'published']),
  order: z.number().default(0),
  locales: z.object({
    en: localizedContentSchema,
    fr: localizedContentSchema.optional(),
  }),
  client: z.string().min(1),
  industry: z.string(),
  services: z.array(z.enum(['web', 'marketing', 'custom'])),
  technologies: z.array(z.string()),
  date: z.string(), // ISO date string
  liveUrl: z.string().url().optional().or(z.literal('')),
  thumbnail: mediaRefSchema,
  heroImage: mediaRefSchema,
  gallery: z.array(mediaRefSchema).default([]),
  metrics: z.array(z.object({
    key: z.string(),
    value: z.string(),
    icon: z.string().optional(),
  })).default([]),
  seo: z.object({
    en: seoMetaSchema,
    fr: seoMetaSchema.optional(),
  }),
});

// GET - List all case studies
export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db.collection('caseStudies').orderBy('order', 'asc');

    if (status && (status === 'draft' || status === 'published')) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const caseStudies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || null,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ caseStudies });
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

// POST - Create new case study
export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = caseStudySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();

    // Check for duplicate slug
    const existingSlug = await db.collection('caseStudies')
      .where('slug', '==', data.slug)
      .get();

    if (!existingSlug.empty) {
      return NextResponse.json(
        { error: 'A case study with this slug already exists' },
        { status: 400 }
      );
    }

    const docRef = db.collection('caseStudies').doc();
    const now = Timestamp.now();

    const caseStudy = {
      id: docRef.id,
      ...data,
      date: Timestamp.fromDate(new Date(data.date)),
      liveUrl: data.liveUrl || null,
      createdAt: now,
      updatedAt: now,
      updatedBy: user.email || user.uid,
    };

    await docRef.set(caseStudy);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      caseStudy: {
        ...caseStudy,
        date: data.date,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating case study:', error);
    return NextResponse.json({ error: 'Failed to create case study' }, { status: 500 });
  }
}
