import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const docRef = db.collection('testimonials').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: Timestamp.now(),
      updatedBy: user.email || user.uid,
    };

    await docRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const docRef = db.collection('testimonials').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
