import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

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

// POST - Sync portfolio data from legacy portfolio collection to this project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const projectRef = db.collection('projects').doc(params.id);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = projectDoc.data()!;
    const projectKey = projectData.key;
    const projectSlug = projectData.portfolio?.slug;

    // Find matching legacy portfolio item by slug or key
    const portfolioSnapshot = await db.collection('portfolio').get();
    let legacyItem: FirebaseFirestore.DocumentData | null = null;
    let legacyItemId: string | null = null;

    for (const doc of portfolioSnapshot.docs) {
      const data = doc.data();
      if (data.slug === projectKey || data.slug === projectSlug) {
        legacyItem = data;
        legacyItemId = doc.id;
        break;
      }
    }

    if (!legacyItem) {
      return NextResponse.json({ error: 'No matching legacy portfolio item found' }, { status: 404 });
    }

    const now = Timestamp.now();

    // Map legacy portfolio data to project portfolio format
    const portfolioData = {
      published: true,
      slug: legacyItem.slug || projectKey,
      categories: legacyItem.categories || (legacyItem.category ? [legacyItem.category] : []),
      thumbnail: legacyItem.thumbnail || '',
      images: legacyItem.images || [],
      industry: legacyItem.industry || '',
      year: legacyItem.year || new Date().getFullYear(),
      services: legacyItem.services || [],
      fullDescription: legacyItem.fullDescription || legacyItem.description || '',
      challenge: legacyItem.challenge || '',
      solution: legacyItem.solution || '',
      results: legacyItem.results || [],
      testimonial: legacyItem.testimonial || null,
      order: legacyItem.order || 0,
      hidden: legacyItem.hidden || false,
      showOnHomepage: legacyItem.showOnHomepage || false,
    };

    // Create activity entry
    const activityEntry = {
      id: `activity_${Date.now()}`,
      action: 'portfolio_synced',
      field: 'portfolio',
      oldValue: 'legacy',
      newValue: 'synced',
      timestamp: now,
      userId: user.uid,
      userEmail: user.email || 'unknown',
    };

    // Update project with synced portfolio data
    await projectRef.update({
      portfolio: portfolioData,
      updatedAt: now,
      updatedBy: user.email || user.uid,
      activityLog: [...(projectData.activityLog || []), activityEntry],
    });

    // Optionally: Delete the legacy portfolio item now that it's synced
    // await db.collection('portfolio').doc(legacyItemId).delete();

    const updatedDoc = await projectRef.get();
    const updatedData = updatedDoc.data()!;

    return NextResponse.json({
      success: true,
      message: 'Portfolio data synced from legacy item',
      legacyItemId,
      project: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error syncing portfolio:', error);
    return NextResponse.json({ error: 'Failed to sync portfolio' }, { status: 500 });
  }
}
