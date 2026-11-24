import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { defaultItems, defaultProfile } from '@/lib/portfolio-versions';
import { PORTFOLIO_COLLECTION, createVersionSchema } from '@/lib/portfolio-schema';

/**
 * Portfolio versions: a catalogue of tailored copies.
 *
 * `POST` seeds a new version from the knowledge base rather than creating an
 * empty one, because an empty portfolio is a form to fill in and a seeded one
 * is a draft to cut down — and cutting down is the actual task.
 */

async function verifyAdmin() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const snapshot = await getAdminDb().collection(PORTFOLIO_COLLECTION).get();

    const versions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          targetRole: data.targetRole ?? null,
          targetCompany: data.targetCompany ?? null,
          notes: data.notes ?? null,
          status: data.status ?? 'draft',
          // The list needs counts, not the items themselves: a catalogue of
          // twenty versions would otherwise ship twenty full portfolios.
          projectCount: (data.items ?? []).filter((i: any) => i.enabled).length,
          totalCount: (data.items ?? []).length,
          cvFileName: data.cv?.fileName ?? null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      })
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error listing portfolio versions:', error);
    return NextResponse.json({ error: 'Failed to list portfolio versions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = createVersionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { copyOf, ...input } = parsed.data;
    const db = getAdminDb();

    let items;
    let profile;

    if (copyOf) {
      const source = await db.collection(PORTFOLIO_COLLECTION).doc(copyOf).get();
      if (!source.exists) {
        return NextResponse.json({ error: 'Version to copy not found' }, { status: 404 });
      }
      const data = source.data()!;
      items = data.items ?? [];
      profile = input.profile ?? data.profile;
    } else {
      [items, profile] = await Promise.all([
        defaultItems(),
        input.profile ? Promise.resolve(input.profile) : defaultProfile(),
      ]);
    }

    const docRef = db.collection(PORTFOLIO_COLLECTION).doc();
    const now = Timestamp.now();

    await docRef.set({
      id: docRef.id,
      ...input,
      status: 'draft',
      profile,
      items,
      createdAt: now,
      updatedAt: now,
      updatedBy: user.email || user.uid,
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio version:', error);
    return NextResponse.json({ error: 'Failed to create portfolio version' }, { status: 500 });
  }
}
