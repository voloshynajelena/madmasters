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
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

// Validation schema (same as in main route)
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

const caseStudyUpdateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  status: z.enum(['draft', 'published']).optional(),
  order: z.number().optional(),
  locales: z.object({
    en: localizedContentSchema,
    fr: localizedContentSchema.optional(),
  }).optional(),
  client: z.string().min(1).optional(),
  industry: z.string().optional(),
  services: z.array(z.enum(['web', 'marketing', 'custom'])).optional(),
  technologies: z.array(z.string()).optional(),
  date: z.string().optional(),
  liveUrl: z.string().url().optional().or(z.literal('')).nullable(),
  thumbnail: mediaRefSchema.optional(),
  heroImage: mediaRefSchema.optional(),
  gallery: z.array(mediaRefSchema).optional(),
  metrics: z.array(z.object({
    key: z.string(),
    value: z.string(),
    icon: z.string().optional(),
  })).optional(),
  seo: z.object({
    en: seoMetaSchema,
    fr: seoMetaSchema.optional(),
  }).optional(),
});

// GET - Get single case study
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const doc = await db.collection('caseStudies').doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      caseStudy: {
        id: doc.id,
        ...data,
        date: data?.date?.toDate?.()?.toISOString() || null,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching case study:', error);
    return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
  }
}

// PUT - Update case study
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = caseStudyUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();
    const docRef = db.collection('caseStudies').doc(params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    // Check for duplicate slug if slug is being changed
    if (data.slug) {
      const existingSlug = await db.collection('caseStudies')
        .where('slug', '==', data.slug)
        .get();

      const isDuplicate = existingSlug.docs.some(d => d.id !== params.id);
      if (isDuplicate) {
        return NextResponse.json(
          { error: 'A case study with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const now = Timestamp.now();
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
      updatedBy: user.email || user.uid,
    };

    // Convert date string to Timestamp if provided
    if (data.date) {
      updateData.date = Timestamp.fromDate(new Date(data.date));
    }

    // Handle empty liveUrl
    if (data.liveUrl === '') {
      updateData.liveUrl = null;
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      caseStudy: {
        id: updatedDoc.id,
        ...updatedData,
        date: updatedData?.date?.toDate?.()?.toISOString() || null,
        createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error updating case study:', error);
    return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 });
  }
}

// DELETE - Delete case study
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const docRef = db.collection('caseStudies').doc(params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting case study:', error);
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
