/**
 * Import App Store screenshots from disk and attach them to a project's
 * components.
 *
 * Run with:
 *   npx tsx scripts/import-app-screens.ts <key> <component-key> <folder> [--limit 6] [--dry-run]
 *
 * These pictures already exist. Every app that has shipped has a folder of
 * them, sized for the store and made deliberately — a better set than a
 * browser could take, and for an app behind a login the only set there is.
 * They were sitting in `docs/release/screenshots-1.1/` and on the desktop
 * while the portfolio showed a sign-in page.
 *
 * Files are resized into `public/content/img/projects/` under a predictable
 * name and written onto the component in Firestore. Ordering follows the file
 * names, which in a store folder are already numbered in the order a reviewer
 * should see them.
 *
 * Resized, not copied: a store screenshot is 1320×2868 and weighs a megabyte
 * or two, and the panel shows it 350 pixels tall. Copying twenty of them put
 * 18 MB of PNG into the repository to render about 1% of those pixels.
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
import { chromium, type Browser } from 'playwright';
import { imageSize } from '../src/lib/image-size';

const [key, componentKey, folder, ...rest] = process.argv.slice(2);
const dryRun = rest.includes('--dry-run');
const limit = Number.parseInt(rest[rest.indexOf('--limit') + 1] ?? '6', 10);

const OUT_DIR = path.join(__dirname, '../public/content/img/projects');
const PUBLIC_PREFIX = '/content/img/projects';

function initFirebase() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials');
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

/** A store folder's names already carry the order: 01-today, 02-check-in. */
function ordered(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter(f => /\.(png|jpe?g)$/i.test(f))
    // " 2" copies are duplicates macOS makes when the same export runs twice.
    .filter(f => !/ \d+\.(png|jpe?g)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** `01-check-in.png` → `check-in`; falls back to the index. */
function slug(file: string, index: number): string {
  const base = path
    .basename(file, path.extname(file))
    .replace(/^\d+[-_ ]*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || String(index + 1);
}

/** Tall enough to stay sharp on a retina screen at the size the panel shows
 *  it, which is about 350 points. Beyond this the extra pixels are never seen. */
const TARGET_HEIGHT = 1100;

/**
 * Rewrite one screenshot smaller, through the browser.
 *
 * The browser is here anyway for the other scripts, it resamples properly,
 * and it writes JPEG — which is the right format for a photograph of a
 * screen and a third of the weight of the PNG the store wanted.
 */
async function resize(browser: Browser, source: string, out: string) {
  const size = imageSize(source);
  if (!size) throw new Error(`Could not measure ${source}`);

  const height = Math.min(TARGET_HEIGHT, size.height);
  const width = Math.round((size.width * height) / size.height);

  // Copied beside the page so the browser can read it: a `file://` document
  // cannot load an image from an unrelated directory.
  const temp = path.join(OUT_DIR, `.src-${path.basename(source)}`);
  const page = path.join(OUT_DIR, `.resize-${Date.now()}.html`);
  fs.copyFileSync(source, temp);
  fs.writeFileSync(
    page,
    `<!doctype html><html><body style="margin:0"><img src="${encodeURI(path.basename(temp))}" style="display:block;width:${width}px;height:${height}px"></body></html>`,
  );

  try {
    const tab = await browser.newPage({ viewport: { width, height } });
    await tab.goto(`file://${page}`);
    await tab.waitForLoadState('networkidle');
    await tab.screenshot({ path: out, type: 'jpeg', quality: 85 });
    await tab.close();
  } finally {
    fs.rmSync(temp, { force: true });
    fs.rmSync(page, { force: true });
  }
}

async function run() {
  if (!key || !componentKey || !folder) {
    throw new Error('Usage: import-app-screens.ts <key> <component-key> <folder> [--limit N]');
  }
  if (!fs.existsSync(folder)) throw new Error(`No such folder: ${folder}`);

  initFirebase();
  const db = getFirestore();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const snapshot = await db.collection('projects').where('key', '==', key).get();
  if (snapshot.empty) throw new Error(`No project with key "${key}"`);

  const doc = snapshot.docs[0];
  const components: any[] = doc.data().components ?? [];
  const index = components.findIndex(c => c.key === componentKey || c.kind === componentKey);
  if (index === -1) {
    throw new Error(
      `No component "${componentKey}" on ${key}. Has: ${components.map(c => `${c.key}/${c.kind}`).join(', ') || '(none)'}`,
    );
  }

  const files = ordered(folder).slice(0, limit);
  if (!files.length) throw new Error('No images in that folder');

  const browser = dryRun ? null : await chromium.launch();
  const urls: string[] = [];

  try {
    for (const [i, file] of files.entries()) {
      const name = `${key}-${componentKey}-${slug(file, i)}.jpg`;
      const source = path.join(folder, file);

      if (!dryRun) {
        const before = fs.statSync(source).size;
        await resize(browser!, source, path.join(OUT_DIR, name));
        const after = fs.statSync(path.join(OUT_DIR, name)).size;
        console.log(
          `   ${file}  →  ${name}  (${Math.round(before / 1024)} → ${Math.round(after / 1024)} КБ)`,
        );
      } else {
        console.log(`   ${file}  →  ${name}`);
      }

      urls.push(`${PUBLIC_PREFIX}/${name}`);
    }
  } finally {
    await browser?.close();
  }

  components[index] = { ...components[index], screenshots: urls };

  if (!dryRun) {
    await doc.ref.update({ components, updatedAt: Timestamp.now(), updatedBy: 'import-app-screens' });
  }

  console.log('');
  console.log(
    dryRun
      ? `Пробный прогон: ${urls.length} шт. для ${key} / ${components[index].name}`
      : `Готово: ${urls.length} шт. у ${key} / ${components[index].name}`,
  );
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
