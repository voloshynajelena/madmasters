import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

const updateUserSchema = z.object({
  displayName: z.string().optional(),
  role: z.enum(['admin', 'editor', 'copywriter']).optional(),
  password: z.string().min(6).optional(),
});

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(params.id).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    return NextResponse.json({
      user: {
        id: userDoc.id,
        ...userData,
        createdAt: userData?.createdAt?.toDate?.()?.toISOString() || null,
        lastLoginAt: userData?.lastLoginAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Update Firebase Auth if password provided
    if (data.password) {
      await auth.updateUser(params.id, { password: data.password });
    }

    if (data.displayName) {
      await auth.updateUser(params.id, { displayName: data.displayName });
    }

    // Update Firestore
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: admin.uid,
    };

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.role) updateData.role = data.role;

    await db.collection('users').doc(params.id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Prevent self-deletion
  if (params.id === admin.uid) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Delete from Firebase Auth
    await auth.deleteUser(params.id);

    // Delete from Firestore
    await db.collection('users').doc(params.id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
