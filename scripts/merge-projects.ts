/**
 * Projects Knowledge Base — merge the seed into what is already there.
 *
 * Run with: npx tsx scripts/merge-projects.ts [--dry-run]
 *
 * `seed-projects.ts --force` writes with `docRef.set(...)`, which replaces the
 * whole document. That is right for a project the seed owns and wrong for one
 * that has been edited in the admin since: the live Librora record had a
 * thumbnail, an owner, a tech lead, its own links and its own environments,
 * none of which the seed file knows about, and forcing would have blanked
 * every one of them to add the sections that were genuinely missing.
 *
 * So this fills blanks instead of overwriting. A field is written only when
 * the live value is absent, empty, or the literal "TBD" placeholder; anything
 * a human has filled in wins over the seed. Where the two disagree and the
 * live value is kept, the disagreement is printed rather than silently
 * resolved — a merge that quietly drops half the seed is the same failure as
 * a force that quietly drops half the record, just in the other direction.
 *
 * New projects are left to the seed script, which is what it is good at.
 *
 * Environment variables required:
 * - Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */

import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

/**
 * Also replace the technical sections where the seed now has more.
 *
 * Off by default, because the merge's whole promise is that it does not
 * overwrite anything a human wrote. But these five sections were first
 * filled by guessing from the outside, and have since been rewritten from
 * each project's own documentation — its ADR log, its threat model, its cost
 * table. A list of seven risks taken from `docs/DECISIONS.md` should win over
 * three inferred ones, and merging them item by item is impossible because
 * the items have no identity.
 *
 * Only a strictly longer list replaces a shorter one, and every replacement
 * is printed.
 */
const replaceRicher = args.includes('--replace-richer');

const RICH_SECTIONS = ['components', 'decisions', 'risks', 'costs', 'registrations'];

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

/**
 * Is this value worth keeping over what the seed offers?
 *
 * "TBD" counts as empty on purpose: it is what the knowledge base was full of
 * before this pass, and it is a placeholder, not an answer.
 */
function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || trimmed === 'TBD' || trimmed === '—';
  }
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Date) return false;
  if (typeof value === 'object') {
    // A Firestore Timestamp is a value, not a container to look inside.
    if (typeof (value as { toDate?: unknown }).toDate === 'function') return false;
    const entries = Object.values(value as Record<string, unknown>);
    return entries.length === 0 || entries.every(isBlank);
  }
  return false;
}

/** Fields the seed must never touch: they are the document's identity or its
 *  audit trail, and the seed's copy of them is either stale or absent. */
const NEVER_WRITE = new Set(['id', 'key', 'createdAt', 'updatedAt', 'updatedBy', 'activityLog']);

type Filled = { path: string; value: unknown };
type Kept = { path: string; live: unknown; seed: unknown };

/**
 * Walk the seed beside the live document, one key at a time.
 *
 * Objects recurse so that a half-filled `stack` or `portfolio` gains the slots
 * it is missing without losing the slots it has — the whole point, since
 * `portfolio.thumbnail` was set live and empty in the seed while
 * `portfolio.challenge` was the other way round. Arrays do not recurse: a list
 * of decisions is written whole or not at all, because merging two lists
 * item-by-item would need an identity the items do not have.
 */
function merge(
  live: Record<string, unknown>,
  seed: Record<string, unknown>,
  prefix: string,
  filled: Filled[],
  kept: Kept[],
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...live };

  for (const [key, seedValue] of Object.entries(seed)) {
    if (prefix === '' && NEVER_WRITE.has(key)) continue;
    const liveValue = live?.[key];
    const where = prefix ? `${prefix}.${key}` : key;

    if (isBlank(seedValue)) continue;

    if (isBlank(liveValue)) {
      out[key] = seedValue;
      filled.push({ path: where, value: seedValue });
      continue;
    }

    const bothPlainObjects =
      seedValue !== null &&
      typeof seedValue === 'object' &&
      !Array.isArray(seedValue) &&
      liveValue !== null &&
      typeof liveValue === 'object' &&
      !Array.isArray(liveValue) &&
      typeof (liveValue as { toDate?: unknown }).toDate !== 'function';

    if (bothPlainObjects) {
      out[key] = merge(
        liveValue as Record<string, unknown>,
        seedValue as Record<string, unknown>,
        where,
        filled,
        kept,
      );
      continue;
    }

    if (
      replaceRicher &&
      prefix === '' &&
      RICH_SECTIONS.includes(key) &&
      Array.isArray(seedValue) &&
      Array.isArray(liveValue) &&
      seedValue.length > liveValue.length
    ) {
      out[key] = seedValue;
      filled.push({ path: `${where} (было ${liveValue.length})`, value: seedValue });
      continue;
    }

    if (JSON.stringify(liveValue) !== JSON.stringify(seedValue)) {
      kept.push({ path: where, live: liveValue, seed: seedValue });
    }
  }

  return out;
}

function brief(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} шт.]`;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text) return String(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

async function mergeProjects() {
  const seedPath = path.join(__dirname, '../src/data/projects.seed.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8')) as {
    projects: Record<string, unknown>[];
  };

  initFirebase();
  const db = getFirestore();
  const projectsRef = db.collection('projects');
  const now = Timestamp.now();

  let merged = 0;
  let untouched = 0;
  let absent = 0;

  for (const seedProject of seedData.projects) {
    const key = seedProject.key as string;
    const existing = await projectsRef.where('key', '==', key).get();

    if (existing.empty) {
      console.log(`${key}: нет в базе — это дело seed-projects.ts`);
      absent++;
      continue;
    }

    const doc = existing.docs[0];
    const live = doc.data();
    const filled: Filled[] = [];
    const kept: Kept[] = [];
    const next = merge(live, seedProject, '', filled, kept);

    if (filled.length === 0) {
      console.log(`${key}: нечего добавить`);
      if (kept.length) {
        for (const k of kept) {
          console.log(`   расходится ${k.path}: в базе ${brief(k.live)} / в сиде ${brief(k.seed)} — оставлено как в базе`);
        }
      }
      untouched++;
      continue;
    }

    console.log(`${key}: добавляю ${filled.length}`);
    for (const f of filled) console.log(`   + ${f.path} = ${brief(f.value)}`);
    for (const k of kept) {
      console.log(`   расходится ${k.path}: в базе ${brief(k.live)} / в сиде ${brief(k.seed)} — оставлено как в базе`);
    }

    if (dryRun) {
      merged++;
      continue;
    }

    await doc.ref.update({
      ...next,
      updatedAt: now,
      updatedBy: 'merge-script',
      activityLog: [
        ...((live.activityLog as unknown[]) || []),
        {
          id: `activity_${Date.now()}`,
          action: 'updated',
          timestamp: now,
          userId: 'system',
          userEmail: 'merge-script',
        },
      ],
    });
    merged++;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(dryRun ? 'Пробный прогон — ничего не записано.' : 'Готово.');
  console.log(`  дополнено: ${merged}`);
  console.log(`  без изменений: ${untouched}`);
  console.log(`  нет в базе: ${absent}`);
  console.log('='.repeat(60));
}

mergeProjects()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Merge failed:', error);
    process.exit(1);
  });
