/**
 * Move a project off the legacy `portfolio` collection and onto its knowledge
 * base record, without losing its pictures.
 *
 * Run with: npx tsx scripts/adopt-legacy-portfolio.ts [--dry-run]
 *
 * The public site reads the knowledge base first and falls back to the legacy
 * collection for slugs the knowledge base has not published. Litrlly and
 * Litrlly Kids existed in both — and the two disagreed about what the product
 * is. The legacy rows called Litrlly "an AI-powered reading companion ...
 * connect with fellow readers"; litrlly.app's own title is "AI-Powered English
 * Pronunciation Learning App", which is what the knowledge base says. So the
 * site was advertising the wrong product, and would keep doing so for as long
 * as the knowledge base record stayed unpublished and the fallback won.
 *
 * Publishing the knowledge base record alone would have fixed the words and
 * lost the cover image, because the legacy row is where the artwork lives.
 * This carries the artwork and the placement across — thumbnail, images,
 * categories, year, services, homepage flag, live URL — and leaves the text
 * to the knowledge base, which is the copy a human maintains and the copy that
 * matches the product. Nothing already set on the knowledge base record is
 * overwritten.
 *
 * The legacy rows are left in place. Once the knowledge base record is
 * published its slug shadows them, so they are already invisible; deleting
 * them is a separate decision and not one a script should make.
 *
 * Environment variables required:
 * - Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */

import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const dryRun = process.argv.slice(2).includes('--dry-run');

/** Knowledge base keys to adopt, matched against legacy `slug`. */
const KEYS = ['litrlly', 'litrlly-kids'];

function initFirebase() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '' || value.trim() === 'TBD';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Take `from` only where `onto` has nothing. */
function fill<T extends Record<string, unknown>>(onto: T, from: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...onto };
  for (const [key, value] of Object.entries(from)) {
    if (!isBlank(value) && isBlank(out[key])) out[key] = value;
  }
  return out as T;
}

async function adopt() {
  initFirebase();
  const db = getFirestore();
  const now = Timestamp.now();
  let done = 0;

  for (const key of KEYS) {
    const kbSnap = await db.collection('projects').where('key', '==', key).get();
    if (kbSnap.empty) {
      console.log(`${key}: нет записи в базе знаний — пропускаю`);
      continue;
    }

    const legacySnap = await db.collection('portfolio').where('slug', '==', key).limit(1).get();
    const legacy = legacySnap.empty ? {} : (legacySnap.docs[0].data() as Record<string, unknown>);

    const doc = kbSnap.docs[0];
    const live = doc.data();

    const portfolio = fill(
      {
        ...(live.portfolio ?? {}),
        slug: (live.portfolio as any)?.slug || key,
        published: true,
        hidden: false,
      },
      {
        thumbnail: legacy.thumbnail,
        images: legacy.images,
        categories: legacy.categories ?? (legacy.category ? [legacy.category] : undefined),
        year: legacy.year,
        services: legacy.services,
        tags: legacy.tags,
        industry: legacy.industry,
        showOnHomepage: legacy.showOnHomepage,
        // Deliberately NOT description/fullDescription: that is the text the
        // knowledge base is right about and the legacy row is wrong about.
      },
    );

    const productUrls =
      !isBlank(live.productUrls) ? live.productUrls
      : !isBlank(legacy.liveUrl) ? [legacy.liveUrl]
      : [];

    console.log(`${key}:`);
    console.log(`   обложка    ${(portfolio as any).thumbnail || '— нет'}`);
    console.log(`   картинок   ${((portfolio as any).images ?? []).length}`);
    console.log(`   категории  ${JSON.stringify((portfolio as any).categories ?? [])}`);
    console.log(`   на главной ${String((portfolio as any).showOnHomepage)}`);
    console.log(`   ссылка     ${(productUrls as string[])[0] ?? '— нет'}`);
    console.log(`   текст      из базы знаний: ${String(live.oneLiner).slice(0, 70)}`);

    if (dryRun) {
      done++;
      continue;
    }

    await doc.ref.update({
      portfolio,
      productUrls,
      updatedAt: now,
      updatedBy: 'adopt-legacy-portfolio',
      activityLog: [
        ...((live.activityLog as unknown[]) || []),
        {
          id: `activity_${Date.now()}`,
          action: 'updated',
          timestamp: now,
          userId: 'system',
          userEmail: 'adopt-legacy-portfolio',
        },
      ],
    });
    done++;
  }

  console.log('');
  console.log(dryRun ? `Пробный прогон — ничего не записано (${done}).` : `Готово: ${done}.`);
}

adopt()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Adopt failed:', error);
    process.exit(1);
  });
