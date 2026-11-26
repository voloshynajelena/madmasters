import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { PORTFOLIO_COLLECTION, patchVersionSchema } from '@/lib/portfolio-schema';

/** A name as it reads in an address bar: "Olena Voloshyna" → olena-voloshyna. */
function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

async function verifyAdmin() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const doc = await getAdminDb().collection(PORTFOLIO_COLLECTION).doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data = doc.data()!;
    return NextResponse.json({
      version: {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('Error reading portfolio version:', error);
    return NextResponse.json({ error: 'Failed to read portfolio version' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = patchVersionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const docRef = db.collection(PORTFOLIO_COLLECTION).doc(params.id);
    if (!(await docRef.get()).exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const patch: Record<string, unknown> = { ...parsed.data };

    /**
     * The address, settled here because only the server can see the others.
     *
     * Defaults to the person's name, since this link is meant to be printed
     * on a résumé and read off it. Uniqueness is checked across every
     * portfolio — two versions aimed at two employers must not fight over
     * `/p/olena-voloshyna` — and a taken one is refused rather than silently
     * renamed, because a link the owner did not choose is a link they will
     * send wrong.
     */
    if (parsed.data.share) {
      const current = (await docRef.get()).data();
      const fallback =
        slugify(parsed.data.profile?.fullName ?? current?.profile?.fullName ?? '') ||
        slugify(parsed.data.name ?? current?.name ?? '') ||
        'portfolio';
      const slug = parsed.data.share.slug || current?.share?.slug || fallback;

      const clash = await db
        .collection(PORTFOLIO_COLLECTION)
        .where('share.slug', '==', slug)
        .limit(2)
        .get();
      if (clash.docs.some(d => d.id !== params.id)) {
        return NextResponse.json(
          { error: `The address "${slug}" is taken by another portfolio.` },
          { status: 409 },
        );
      }

      patch.share = {
        enabled: parsed.data.share.enabled,
        slug,
        updatedAt: new Date().toISOString(),
      };
    }

    await docRef.update({
      ...patch,
      updatedAt: Timestamp.now(),
      updatedBy: user.email || user.uid,
    });

    return NextResponse.json({ ok: true, share: patch.share ?? null });
  } catch (error) {
    console.error('Error updating portfolio version:', error);
    return NextResponse.json({ error: 'Failed to update portfolio version' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await getAdminDb().collection(PORTFOLIO_COLLECTION).doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting portfolio version:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio version' }, { status: 500 });
  }
}
