import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') return null;
    return decodedClaims;
  } catch {
    return null;
  }
}

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST() {
  try {
    const user = await verifyAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    const db = getAdminDb();
    const freshWorksSnapshot = await db.collection('freshWorks').get();

    if (freshWorksSnapshot.empty) {
      return NextResponse.json({ message: 'No Fresh Works items to migrate', migrated: 0 });
    }

    let migrated = 0;
    const errors: string[] = [];

    // Get max order from portfolio
    const maxOrderQuery = await db
      .collection('portfolio')
      .orderBy('order', 'desc')
      .limit(1)
      .get();
    let currentOrder = maxOrderQuery.empty ? 0 : (maxOrderQuery.docs[0].data().order || 0);

    for (const doc of freshWorksSnapshot.docs) {
      const data = doc.data();
      const slug = data.slug || generateSlug(data.title || '');

      // Check if slug already exists in portfolio
      const existingSlug = await db
        .collection('portfolio')
        .where('slug', '==', slug)
        .get();

      if (!existingSlug.empty) {
        errors.push(`Skipped "${data.title}": slug "${slug}" already exists`);
        continue;
      }

      currentOrder++;

      // Convert to portfolio format
      const portfolioItem = {
        slug,
        name: data.title,
        description: data.description || '',
        fullDescription: data.fullDescription || data.description || '',
        category: data.source === 'web' ? 'web' : 'mobile',
        tags: data.tags || [],
        thumbnail: data.thumbnail || '',
        images: data.images || [data.thumbnail].filter(Boolean),
        client: data.client || data.title,
        industry: data.industry || data.platform || 'Technology',
        year: data.year || new Date().getFullYear(),
        services: data.services || [],
        technologies: data.technologies || [],
        liveUrl: data.liveUrl || data.url || '',
        challenge: data.challenge || '',
        solution: data.solution || '',
        results: data.results || [],
        testimonial: null,
        order: currentOrder,
        status: data.hidden ? 'draft' : 'published',
        hidden: data.hidden || false,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFrom: 'freshWorks',
        originalId: doc.id,
      };

      // Add to portfolio
      await db.collection('portfolio').add(portfolioItem);

      // Delete from freshWorks
      await db.collection('freshWorks').doc(doc.id).delete();

      migrated++;
    }

    return NextResponse.json({
      message: `Migration complete`,
      migrated,
      errors,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
