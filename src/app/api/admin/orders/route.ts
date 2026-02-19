import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

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

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Fetch all orders and filter in memory to avoid composite index requirement
    const snapshot = await db.collection('orders').get();
    let orders: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      reviewedAt: doc.data().reviewedAt?.toDate?.()?.toISOString() || null,
    }));

    // Filter by status
    if (status && ['new', 'reviewed', 'archived'].includes(status)) {
      orders = orders.filter(o => o.status === status);
    }

    // Filter by type
    if (type && ['brief', 'calculator', 'contact'].includes(type)) {
      orders = orders.filter(o => o.type === type);
    }

    // Sort by createdAt desc
    orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Limit to 100
    orders = orders.slice(0, 100);

    // Get counts by status
    const countsSnapshot = await db.collection('orders').get();
    const counts = { new: 0, reviewed: 0, archived: 0, total: countsSnapshot.size };
    countsSnapshot.forEach(doc => {
      const s = doc.data().status;
      if (s in counts) counts[s as keyof typeof counts]++;
    });

    return NextResponse.json({ orders, counts });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
