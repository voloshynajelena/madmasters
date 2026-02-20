import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

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

// GET - List all messages with optional filters
export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search')?.toLowerCase();

    const snapshot = await db.collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    let messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        subject: data.subject || '',
        body: data.body || data.message || '',
        status: data.status || 'new',
        source: data.source || 'other',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        readAt: data.readAt?.toDate?.()?.toISOString() || null,
        repliedAt: data.repliedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Apply filters
    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      messages = messages.filter(m => m.status === status);
    }

    if (source && ['contact', 'brief', 'calculator', 'telegram', 'other'].includes(source)) {
      messages = messages.filter(m => m.source === source);
    }

    if (search) {
      messages = messages.filter(m =>
        m.name?.toLowerCase().includes(search) ||
        m.email?.toLowerCase().includes(search) ||
        m.body?.toLowerCase().includes(search) ||
        m.subject?.toLowerCase().includes(search)
      );
    }

    // Count by status
    const counts = {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
      read: messages.filter(m => m.status === 'read').length,
      replied: messages.filter(m => m.status === 'replied').length,
      archived: messages.filter(m => m.status === 'archived').length,
    };

    return NextResponse.json({ messages, counts });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
