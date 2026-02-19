import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

const contentBlockSchema = z.object({
  section: z.string(),
  key: z.string(),
  type: z.enum(['text', 'richtext', 'image', 'link']),
  locales: z.object({
    en: z.object({
      value: z.string(),
      alt: z.string().optional(),
    }),
    fr: z.object({
      value: z.string(),
      alt: z.string().optional(),
    }).optional(),
  }),
});

async function verifyEditor() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    // Allow admin, editor, and copywriter
    if (!['admin', 'editor', 'copywriter'].includes(userData?.role)) return null;

    return decodedClaims;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await verifyEditor();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const contentSnapshot = await db.collection('content').orderBy('section').get();

    const content = contentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyEditor();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = contentBlockSchema.parse(body);

    const db = getAdminDb();
    const docId = `${data.section}_${data.key}`;

    await db.collection('content').doc(docId).set({
      ...data,
      updatedAt: new Date(),
      updatedBy: user.uid,
    });

    return NextResponse.json({ success: true, id: docId });
  } catch (error) {
    console.error('Error saving content:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}

// Bulk update content
export async function PUT(request: NextRequest) {
  const user = await verifyEditor();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body as { items: Array<z.infer<typeof contentBlockSchema>> };

    const db = getAdminDb();
    const batch = db.batch();

    for (const item of items) {
      const docId = `${item.section}_${item.key}`;
      const ref = db.collection('content').doc(docId);
      batch.set(ref, {
        ...item,
        updatedAt: new Date(),
        updatedBy: user.uid,
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
