import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { defaultSocialLinks, type SocialLink } from '@/data/social-links';

const COLLECTION = 'settings';
const DOC_ID = 'social-links';

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

// GET - fetch social links
export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();

    if (!doc.exists) {
      // Return defaults if not configured
      return NextResponse.json({ links: defaultSocialLinks });
    }

    const data = doc.data();
    return NextResponse.json({ links: data?.links || defaultSocialLinks });
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json({ links: defaultSocialLinks });
  }
}

// POST - update social links
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !['admin', 'editor'].includes(session.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { links } = body as { links: SocialLink[] };

    if (!links || !Array.isArray(links)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection(COLLECTION).doc(DOC_ID).set({
      links,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error('Error saving social links:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
