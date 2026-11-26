/**
 * Build a project's history from its own git log.
 *
 * Run with:
 *   npx tsx scripts/import-git-history.ts <key> <repo-path> [--subdir apps/web] [--limit 40] [--dry-run]
 *
 * A portfolio claims a project was built. The repository is the only record
 * that says when, in what order, and at what pace — and it is a record
 * nobody wrote for the portfolio, which is exactly why it is worth showing.
 *
 * Not every commit. Librora has 742, and a list of 742 subjects is not a
 * history, it is a wall. What is kept is the shape — first commit, last
 * commit, how many, how many months — and the commits that announced
 * something: conventional-commit `feat:` first, then `fix:` for the ones
 * whose subject says what broke. Chores, formatting and merge commits are
 * dropped; they are real work and they say nothing to a reader.
 *
 * Environment variables required:
 * - Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */

import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const [key, repo, ...rest] = process.argv.slice(2);
const dryRun = rest.includes('--dry-run');
const subdir = rest.includes('--subdir') ? rest[rest.indexOf('--subdir') + 1] : null;
const limit = Number.parseInt(rest[rest.indexOf('--limit') + 1] ?? '40', 10);

function initFirebase() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Missing Firebase Admin credentials');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

interface Commit {
  hash: string;
  date: string;
  subject: string;
  kind: string;
}

/** Commits whose subject is addressed to a reader rather than to the build. */
const TELLING = /^(feat|fix|perf|refactor)(\(([^)]*)\))?!?:\s*/i;
/** Work that happened and says nothing: dependency bumps, formatting, merges. */
const NOISE = /^(chore|style|ci|build|test|docs|revert|merge|wip|bump|update deps|initial commit)\b/i;

function log(repoPath: string): Commit[] {
  const args = [
    '-C', repoPath,
    'log',
    '--no-merges',
    '--date=short',
    '--pretty=format:%h%ad%s',
  ];
  if (subdir) args.push('--', subdir);

  const out = execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

  return out
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [hash, date, subject] = line.split('');
      const match = TELLING.exec(subject ?? '');
      return {
        hash,
        date,
        // The prefix is scaffolding for the commit log, not for a reader.
        subject: (subject ?? '').replace(TELLING, '').trim(),
        kind: match?.[1]?.toLowerCase() ?? 'other',
      };
    })
    .filter(c => c.subject && !NOISE.test(c.subject));
}

/**
 * Thin a long log down to the commits worth printing.
 *
 * Spread across the project's life rather than taken off the top: the most
 * recent forty commits of a two-year project describe the last fortnight and
 * call it a history. One pass takes the features, and the remainder is
 * filled from the rest in date order.
 */
function select(commits: Commit[], max: number): Commit[] {
  const features = commits.filter(c => c.kind === 'feat');
  const chosen = features.length >= max ? spread(features, max) : features.slice();

  if (chosen.length < max) {
    const taken = new Set(chosen.map(c => c.hash));
    const rest = commits.filter(c => !taken.has(c.hash));
    chosen.push(...spread(rest, max - chosen.length));
  }

  return chosen.sort((a, b) => b.date.localeCompare(a.date));
}

/** Every nth item, so the sample covers the whole span rather than one end. */
function spread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items.slice();
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

async function run() {
  if (!key || !repo) throw new Error('Usage: import-git-history.ts <key> <repo-path> [--subdir dir]');
  if (!fs.existsSync(path.join(repo, '.git'))) throw new Error(`Not a git repository: ${repo}`);

  initFirebase();
  const db = getFirestore();

  const snapshot = await db.collection('projects').where('key', '==', key).get();
  if (snapshot.empty) throw new Error(`No project with key "${key}"`);

  const all = log(repo);
  if (!all.length) throw new Error('No commits worth showing in that repository');

  const dates = all.map(c => c.date).sort();
  const months = new Set(dates.map(d => d.slice(0, 7)));

  const history = {
    commits: select(all, limit),
    totalCommits: all.length,
    firstCommit: dates[0],
    lastCommit: dates[dates.length - 1],
    activeMonths: months.size,
    source: subdir ? `${path.basename(repo)}/${subdir}` : path.basename(repo),
  };

  console.log(`${key}: ${history.totalCommits} рассказывающих коммитов, ${history.activeMonths} активных месяцев`);
  console.log(`   ${history.firstCommit} → ${history.lastCommit}, в историю попало ${history.commits.length}`);
  history.commits.slice(0, 5).forEach(c => console.log(`   ${c.date}  ${c.kind.padEnd(8)} ${c.subject.slice(0, 68)}`));
  if (history.commits.length > 5) console.log(`   … ещё ${history.commits.length - 5}`);

  if (!dryRun) {
    await snapshot.docs[0].ref.update({
      history,
      updatedAt: Timestamp.now(),
      updatedBy: 'import-git-history',
    });
  }
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
