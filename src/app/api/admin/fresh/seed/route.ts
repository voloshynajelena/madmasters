import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

const COLLECTION = 'freshWorks';

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

const seedItems = [
  {
    source: 'web',
    title: 'Litrlly',
    description: 'AI-powered reading companion that transforms how you engage with books. Track your reading, get personalized insights, and connect with fellow readers.',
    url: 'https://litrlly.app/',
    thumbnail: '/content/img/fresh/litrlly.png',
    platform: 'Web App',
    tags: ['AI', 'Reading', 'Books'],
    metrics: {},
    pinned: true,
    hidden: false,
  },
  {
    source: 'web',
    title: 'Litrlly Kids',
    description: 'Child-friendly reading platform designed to spark a love for books in young readers. Safe, engaging, and educational.',
    url: 'https://kids.litrlly.app/',
    thumbnail: '/content/img/fresh/litrlly-kids.png',
    platform: 'Web App',
    tags: ['Education', 'Kids', 'Reading'],
    metrics: {},
    pinned: false,
    hidden: false,
  },
  {
    source: 'web',
    title: 'Librora',
    description: 'Modern digital library management system. Organize your book collection, track reading progress, and discover new titles.',
    url: 'https://librora.io/profile',
    thumbnail: '/content/img/fresh/librora.png',
    platform: 'Web App',
    tags: ['Library', 'Books', 'Organization'],
    metrics: {},
    pinned: false,
    hidden: false,
  },
];

// PUT - Update existing items to 'web' source
export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();

    // Update all items with source 'custom' to 'web'
    const snapshot = await db.collection(COLLECTION).get();
    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Find matching seed item by URL
      const seedItem = seedItems.find(item => item.url === data.url);
      if (seedItem) {
        batch.update(doc.ref, {
          source: 'web',
          thumbnail: seedItem.thumbnail,
          platform: 'Web App',
          updatedAt: new Date().toISOString(),
        });
        updateCount++;
      }
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Updated ${updateCount} items to web source`,
    });
  } catch (error) {
    console.error('Error updating fresh works:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// POST - Seed new items
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();

    // Get current max order
    const maxOrderQuery = await db
      .collection(COLLECTION)
      .orderBy('order', 'desc')
      .limit(1)
      .get();

    let currentOrder = maxOrderQuery.empty ? 0 : (maxOrderQuery.docs[0].data().order || 0);

    // Add items
    const batch = db.batch();
    const addedItems: string[] = [];

    for (const item of seedItems) {
      // Check if item with same URL already exists
      const existing = await db
        .collection(COLLECTION)
        .where('url', '==', item.url)
        .limit(1)
        .get();

      if (existing.empty) {
        currentOrder++;
        const docRef = db.collection(COLLECTION).doc();
        batch.set(docRef, {
          ...item,
          order: currentOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        addedItems.push(item.title);
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: addedItems.length > 0
        ? `Added ${addedItems.length} items: ${addedItems.join(', ')}`
        : 'All items already exist',
    });
  } catch (error) {
    console.error('Error seeding fresh works:', error);
    return NextResponse.json({ error: 'Failed to seed fresh works' }, { status: 500 });
  }
}
