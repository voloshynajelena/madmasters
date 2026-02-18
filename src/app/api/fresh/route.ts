import { NextResponse } from 'next/server';
import { fetchFreshWorks, type FreshWorkOverride } from '@/lib/fresh-works';
import { getAdminDb } from '@/lib/firebase/admin';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Get overrides from Firestore
    let overrides: FreshWorkOverride[] = [];

    try {
      const db = getAdminDb();
      const snapshot = await db.collection('freshWorkOverrides').get();
      overrides = snapshot.docs.map((doc) => ({
        sourceId: doc.id,
        ...doc.data(),
      })) as FreshWorkOverride[];
    } catch (err) {
      console.error('Error fetching overrides:', err);
      // Continue without overrides
    }

    // Fetch fresh works with overrides applied
    const data = await fetchFreshWorks(overrides);

    // Cache the result in Firestore for fallback
    try {
      const db = getAdminDb();
      await db.collection('freshWorkCache').doc('latest').set({
        ...data,
        fetchedAt: new Date(),
      });
    } catch (err) {
      console.error('Error caching fresh works:', err);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in fresh works API:', error);

    // Try to return cached data as fallback
    try {
      const db = getAdminDb();
      const cached = await db.collection('freshWorkCache').doc('latest').get();
      if (cached.exists) {
        return NextResponse.json({
          ...cached.data(),
          fromCache: true,
        });
      }
    } catch {
      // No cache available
    }

    return NextResponse.json(
      { items: [], lastUpdated: new Date().toISOString(), error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
