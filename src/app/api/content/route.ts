import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Query } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const section = searchParams.get('section');
  const locale = searchParams.get('locale') || 'en';

  try {
    const db = getAdminDb();
    let query: Query = db.collection('content');

    if (page) {
      query = query.where('page', '==', page);
    }

    if (section) {
      query = query.where('section', '==', section);
    }

    const contentSnapshot = await query.get();

    const content: Record<string, string> = {};
    contentSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Create key with page prefix if available
      const keyPrefix = data.page ? `${data.page}.` : '';
      const key = `${keyPrefix}${data.section}.${data.key}`;
      const value = data.locales?.[locale]?.value || data.locales?.en?.value || '';
      content[key] = value;

      // Also add shorthand key for backward compatibility (section.key)
      const shortKey = `${data.section}.${data.key}`;
      if (!content[shortKey]) {
        content[shortKey] = value;
      }
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ content: {} });
  }
}
