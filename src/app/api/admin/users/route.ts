import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  role: z.enum(['admin', 'editor', 'copywriter']),
});

async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Check if user is admin
    const db = getAdminDb();
    const userRef = db.collection('users').doc(decodedClaims.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // First time user - create as admin
      await userRef.set({
        email: decodedClaims.email,
        displayName: decodedClaims.name || null,
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      return decodedClaims;
    }

    const userData = userDoc.data();
    if (userData?.role !== 'admin') return null;

    return decodedClaims;
  } catch (error) {
    console.error('verifyAdmin error:', error);
    return null;
  }
}

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    // Get all users without orderBy to avoid index requirements
    const usersSnapshot = await db.collection('users').get();

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        displayName: data.displayName || null,
        role: data.role || 'editor',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Sort by createdAt in memory (most recent first)
    users.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: data.email,
      displayName: data.displayName || null,
      role: data.role,
      createdAt: new Date(),
      createdBy: admin.uid,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
