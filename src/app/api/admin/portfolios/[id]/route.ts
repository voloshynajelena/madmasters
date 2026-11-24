import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { PORTFOLIO_COLLECTION, patchVersionSchema } from '@/lib/portfolio-schema';

async function verifyAdmin() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const doc = await getAdminDb().collection(PORTFOLIO_COLLECTION).doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data = doc.data()!;
    return NextResponse.json({
      version: {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('Error reading portfolio version:', error);
    return NextResponse.json({ error: 'Failed to read portfolio version' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = patchVersionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const docRef = db.collection(PORTFOLIO_COLLECTION).doc(params.id);
    if (!(await docRef.get()).exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await docRef.update({
      ...parsed.data,
      updatedAt: Timestamp.now(),
      updatedBy: user.email || user.uid,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating portfolio version:', error);
    return NextResponse.json({ error: 'Failed to update portfolio version' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await getAdminDb().collection(PORTFOLIO_COLLECTION).doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting portfolio version:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio version' }, { status: 500 });
  }
}
