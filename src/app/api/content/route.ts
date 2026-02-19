import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const locale = searchParams.get('locale') || 'en';

  try {
    const db = getAdminDb();
    let query = db.collection('content');

    if (section) {
      query = query.where('section', '==', section) as typeof query;
    }

    const contentSnapshot = await query.get();

    const content: Record<string, string> = {};
    contentSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.section}.${data.key}`;
      const value = data.locales?.[locale]?.value || data.locales?.en?.value || '';
      content[key] = value;
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ content: {} });
  }
}
