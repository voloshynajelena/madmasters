import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import type { FreshWorkItem } from '@/lib/fresh-works';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch all fresh works from Firestore (filter in memory to avoid composite index requirement)
    const snapshot = await db
      .collection('freshWorks')
      .get();

    const items: FreshWorkItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Filter out hidden items
      if (!data.hidden) {
        items.push({ ...data, id: doc.id } as FreshWorkItem);
      }
    });

    // Sort: pinned items first, then by order
    items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (a.order || 0) - (b.order || 0);
    });

    return NextResponse.json({
      items,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in fresh works API:', error);

    return NextResponse.json(
      { items: [], lastUpdated: new Date().toISOString(), error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
