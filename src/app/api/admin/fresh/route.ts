import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import type { FreshWorkItem } from '@/lib/fresh-works';

const COLLECTION = 'freshWorks';

async function verifySession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    return { ...decodedClaims, role: userData?.role };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('order', 'asc')
      .get();

    const items: FreshWorkItem[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as FreshWorkItem);
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching fresh works:', error);
    return NextResponse.json({ error: 'Failed to fetch fresh works' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !['admin', 'editor'].includes(session.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    // Get max order
    const maxOrderQuery = await db
      .collection(COLLECTION)
      .orderBy('order', 'desc')
      .limit(1)
      .get();

    const maxOrder = maxOrderQuery.empty ? 0 : (maxOrderQuery.docs[0].data().order || 0);

    const item: Omit<FreshWorkItem, 'id'> = {
      source: data.source || 'custom',
      title: data.title,
      description: data.description || '',
      url: data.url,
      thumbnail: data.thumbnail || '',
      platform: data.platform || '',
      tags: data.tags || [],
      metrics: data.metrics || {},
      order: maxOrder + 1,
      pinned: data.pinned || false,
      hidden: data.hidden || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(item);

    return NextResponse.json({ id: docRef.id, ...item }, { status: 201 });
  } catch (error) {
    console.error('Error creating fresh work:', error);
    return NextResponse.json({ error: 'Failed to create fresh work' }, { status: 500 });
  }
}
