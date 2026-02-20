import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { defaultSocialLinks } from '@/data/social-links';

const COLLECTION = 'settings';
const DOC_ID = 'social-links';

// GET - fetch enabled social links for public display
export async function GET() {
  try {
    const db = getAdminDb();
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();

    if (!doc.exists) {
      // Return enabled defaults
      const enabledLinks = defaultSocialLinks
        .filter(link => link.enabled && link.url)
        .sort((a, b) => a.order - b.order);
      return NextResponse.json({ links: enabledLinks });
    }

    const data = doc.data();
    const links = (data?.links || defaultSocialLinks)
      .filter((link: { enabled: boolean; url: string }) => link.enabled && link.url)
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order);

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching social links:', error);
    // Return enabled defaults on error
    const enabledLinks = defaultSocialLinks
      .filter(link => link.enabled && link.url)
      .sort((a, b) => a.order - b.order);
    return NextResponse.json({ links: enabledLinks });
  }
}
