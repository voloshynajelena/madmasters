import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { defaultItems, itemForProject } from '@/lib/portfolio-versions';
import { PORTFOLIO_COLLECTION } from '@/lib/portfolio-schema';

/**
 * Pull a version back towards the knowledge base.
 *
 * Deliberate and per-item, never automatic. A version is a snapshot so that
 * an application already sent keeps saying what it said; silently refreshing
 * it would undo the tailoring that is the whole point. But a project that has
 * genuinely changed — a component added, a decision recorded — should be easy
 * to take again, and retyping it would be absurd.
 *
 * With no `projectKey`, this reports which projects are new since the version
 * was made rather than adding them, because adding a project to a portfolio
 * is an editorial decision.
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

const bodySchema = z.object({
  /** One item to refresh. Omitted: report what is missing instead. */
  projectKey: z.string().optional(),
  /** Add every project the version does not have yet, switched off. */
  addMissing: z.boolean().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection(PORTFOLIO_COLLECTION).doc(params.id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const items: any[] = doc.data()!.items ?? [];
    const { projectKey, addMissing } = parsed.data;

    if (projectKey) {
      const index = items.findIndex(i => i.projectKey === projectKey);
      if (index === -1) return NextResponse.json({ error: 'Item not in this version' }, { status: 404 });

      const fresh = await itemForProject(projectKey, items[index].order);
      if (!fresh) {
        return NextResponse.json({ error: 'Project no longer in the knowledge base' }, { status: 404 });
      }

      // What the user chose about this item survives the refresh: whether it
      // is shown at all, where it sits, which blocks are on, and the bullets
      // they wrote themselves, which exist nowhere else.
      return NextResponse.json({
        item: {
          ...fresh,
          enabled: items[index].enabled,
          order: items[index].order,
          blocks: items[index].blocks,
          highlights: items[index].highlights ?? [],
          role: items[index].role ?? fresh.role,
        },
      });
    }

    const fresh = await defaultItems();
    const present = new Set(items.map(i => i.projectKey));
    const missing = fresh.filter(i => !present.has(i.projectKey));

    if (!addMissing) {
      return NextResponse.json({
        missing: missing.map(i => ({ projectKey: i.projectKey, name: i.name })),
      });
    }

    const maxOrder = items.reduce((max, i) => Math.max(max, i.order ?? 0), -1);
    return NextResponse.json({
      items: [
        ...items,
        // Off by default: a project appearing in the knowledge base is not a
        // decision to show it to this reader.
        ...missing.map((item, n) => ({ ...item, enabled: false, order: maxOrder + 1 + n })),
      ],
    });
  } catch (error) {
    console.error('Error resyncing portfolio version:', error);
    return NextResponse.json({ error: 'Failed to resync' }, { status: 500 });
  }
}
