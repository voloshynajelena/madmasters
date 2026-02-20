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
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

// GET - Get single message
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
    const doc = await db.collection('messages').doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const data = doc.data();
    const message = {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
      readAt: data?.readAt?.toDate?.()?.toISOString() || null,
      repliedAt: data?.repliedAt?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}

// PATCH - Update message status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('messages').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    const now = Timestamp.now();

    if (status === 'read' && doc.data()?.status === 'new') {
      updateData.readAt = now;
      updateData.readBy = user.email || user.uid;
    } else if (status === 'replied') {
      updateData.repliedAt = now;
      updateData.repliedBy = user.email || user.uid;
    }

    await docRef.update(updateData);

    // Also update the orders collection for backwards compatibility
    const orderRef = db.collection('orders').doc(params.id);
    const orderDoc = await orderRef.get();
    if (orderDoc.exists) {
      await orderRef.update({
        status: status === 'archived' ? 'archived' : status === 'new' ? 'new' : 'reviewed',
        reviewedAt: status !== 'new' ? now : null,
        reviewedBy: status !== 'new' ? (user.email || user.uid) : null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE - Delete message
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
    const docRef = db.collection('messages').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await docRef.delete();

    // Also delete from orders collection
    const orderRef = db.collection('orders').doc(params.id);
    const orderDoc = await orderRef.get();
    if (orderDoc.exists) {
      await orderRef.delete();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
