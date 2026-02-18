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

const overrideSchema = z.object({
  sourceId: z.string().min(1),
  pinned: z.boolean(),
  hidden: z.boolean(),
  summaryOverride: z.string().optional(),
  tagsOverride: z.array(z.string()).optional(),
});

// GET - List all overrides
export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const snapshot = await db.collection('freshWorkOverrides').get();
    const overrides = snapshot.docs.map((doc) => ({
      sourceId: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ overrides });
  } catch (error) {
    console.error('Error fetching overrides:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST - Create or update override
export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const validationResult = overrideSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();
    const docRef = db.collection('freshWorkOverrides').doc(data.sourceId);

    await docRef.set({
      pinned: data.pinned,
      hidden: data.hidden,
      summaryOverride: data.summaryOverride || null,
      tagsOverride: data.tagsOverride || null,
      updatedAt: Timestamp.now(),
      updatedBy: user.email || user.uid,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving override:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

// DELETE - Remove override
export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId required' }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection('freshWorkOverrides').doc(sourceId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting override:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
