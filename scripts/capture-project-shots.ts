/**
 * Take a screenshot and a logo of every project that has a live URL.
 *
 * Run with: npx tsx scripts/capture-project-shots.ts [--only key] [--force] [--dry-run]
 *
 * The portfolio builder shows each project as a tile — a screenshot with the
 * product's logo on it — and a gallery behind it, and the knowledge base had
 * images for none of the recent projects. Entering them by hand means finding the site, framing a
 * capture, exporting at a sane size and remembering where the logo lives,
 * once per project and again whenever a site is redesigned. A browser can do
 * all of that, so it does.
 *
 * Captures land in `public/content/img/projects/`, next to the existing
 * portfolio images, rather than in object storage: that is where this
 * repository already keeps its artwork, it needs no bucket rules or CORS, and
 * Vercel serves it from the CDN. Screenshots are JPEG because they are
 * photographs of a screen and PNG triples the weight for nothing; logos stay
 * PNG because they have transparency.
 *
 * Firestore is only filled where it is empty. A project whose thumbnail was
 * chosen by hand keeps it unless `--force` says otherwise.
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
import { chromium, type Page } from 'playwright';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const OUT_DIR = path.join(__dirname, '../public/content/img/projects');
const PUBLIC_PREFIX = '/content/img/projects';

/** Wide enough to look like a desktop site, short enough to crop to a tile. */
const VIEWPORT = { width: 1440, height: 900 };

/** How many frames to take down each page: one for the tile, the rest for the
 *  gallery. Three is where it stops being a product tour and starts being a
 *  scroll recording. */
const GALLERY_FRAMES = 3;

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
 * The product's own icon, as the page declares it.
 *
 * `apple-touch-icon` first because it is square by specification and large by
 * convention; `og:image` is deliberately last and only as a fallback, since it
 * is usually a wide social banner rather than a mark.
 */
async function findLogoUrl(page: Page): Promise<string | null> {
  // Passed as source text rather than as a function. tsx compiles with
  // esbuild's `keepNames`, which wraps every named function in a `__name`
  // helper; Playwright serialises the compiled source and ships it to the
  // page, where `__name` does not exist and every evaluate throws
  // "ReferenceError: __name is not defined". A string is never compiled.
  return page.evaluate(`(() => {
    const abs = (href) => new URL(href, document.baseURI).href;

    const apple = document.querySelector('link[rel~="apple-touch-icon"]');
    if (apple && apple.getAttribute('href')) return abs(apple.getAttribute('href'));

    // Among ordinary icons the biggest declared size wins; an undeclared one
    // counts as small, so a 16px favicon never beats a 512px manifest icon.
    const icons = Array.prototype.slice
      .call(document.querySelectorAll('link[rel~="icon"]'))
      .map((el) => {
        const sizes = el.getAttribute('sizes') || '';
        const px = parseInt(sizes.split('x')[0], 10);
        return { href: el.getAttribute('href') || '', size: isFinite(px) ? px : 0 };
      })
      .filter((i) => i.href && !/\\.ico(\\?|$)/i.test(i.href))
      .sort((a, b) => b.size - a.size);
    if (icons[0]) return abs(icons[0].href);

    const manifestIcon = document.querySelector('link[rel="mask-icon"]');
    if (manifestIcon && manifestIcon.getAttribute('href')) return abs(manifestIcon.getAttribute('href'));

    const og = document.querySelector('meta[property="og:image"]');
    if (og && og.getAttribute('content')) return abs(og.getAttribute('content'));

    return null;
  })()`) as Promise<string | null>;
}

async function download(url: string, to: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const type = res.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return false;
    fs.writeFileSync(to, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch {
    return false;
  }
}

async function capture() {
  initFirebase();
  const db = getFirestore();
  const snapshot = await db.collection('projects').get();

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    // Some hosts serve a stripped page to an unknown agent; this is the same
    // Chromium underneath, just not announcing itself as automated.
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  });

  let shots = 0;
  let logos = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const key: string = data.key ?? doc.id;
    if (only && key !== only) continue;

    const url: string | undefined = data.productUrls?.[0];
    if (!url) {
      console.log(`${key}: нет адреса — пропускаю`);
      continue;
    }

    const hasShot = (data.portfolio?.images ?? []).length > 0;
    const hasLogo = Boolean(data.portfolio?.thumbnail);
    if (hasShot && hasLogo && !force) {
      console.log(`${key}: картинки уже есть (--force чтобы переснять)`);
      continue;
    }

    const page = await context.newPage();
    const patch: Record<string, unknown> = {};

    try {
      console.log(`${key}: открываю ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
      // Fonts swap and hero animations settle after the network is quiet, and
      // a capture taken before that shows a half-drawn page.
      await page.waitForTimeout(2500);

      if (!hasShot || force) {
        const captured: string[] = [];

        // The first frame is the tile. The rest are the gallery, taken one
        // screen apart down the page: a landing page says different things in
        // its hero, its features and its pricing, and a portfolio that shows
        // only the hero shows the part every landing page has in common.
        for (let frame = 0; frame < GALLERY_FRAMES; frame++) {
          if (frame > 0) {
            const moved = await page.evaluate(`(() => {
              const before = window.scrollY;
              window.scrollBy(0, window.innerHeight * 0.9);
              return window.scrollY > before + 40;
            })()`);
            // A short page stops scrolling, and further frames would all be
            // the same footer.
            if (!moved) break;
            await page.waitForTimeout(1200);
          }

          const name = frame === 0 ? `${key}.jpg` : `${key}-${frame + 1}.jpg`;
          if (!dryRun) {
            await page.screenshot({ path: path.join(OUT_DIR, name), type: 'jpeg', quality: 82 });
          }
          captured.push(`${PUBLIC_PREFIX}/${name}`);
        }

        await page.evaluate('window.scrollTo(0, 0)');
        patch['portfolio.images'] = captured;
        console.log(`   скриншотов → ${captured.length}: ${captured.map(c => c.split('/').pop()).join(', ')}`);
        shots += captured.length;
      }

      if (!hasLogo || force) {
        const logoUrl = await findLogoUrl(page);

        // Create React App ships `logo192.png` and `logo512.png` — the React
        // atom — and an app that never replaced them declares one as its icon.
        // Taking it gives the portfolio a tile branded with somebody else's
        // framework, which is what happened to Litrlly on the first run.
        const isFrameworkDefault = logoUrl && /\/logo(192|512)\.png(\?|$)/i.test(logoUrl);
        if (isFrameworkDefault) {
          console.log(`   логотип  → ${logoUrl} — это заглушка Create React App, пропускаю`);
        }

        if (logoUrl && !isFrameworkDefault) {
          const ext = new URL(logoUrl).pathname.match(/\.(png|jpg|jpeg|svg|webp)$/i)?.[1] ?? 'png';
          const file = path.join(OUT_DIR, `${key}-logo.${ext.toLowerCase()}`);
          if (dryRun || (await download(logoUrl, file))) {
            patch['portfolio.thumbnail'] = `${PUBLIC_PREFIX}/${key}-logo.${ext.toLowerCase()}`;
            console.log(`   логотип  → ${logoUrl}`);
            logos++;
          } else {
            console.log(`   логотип  → не скачался: ${logoUrl}`);
          }
        } else if (!logoUrl) {
          console.log('   логотип  → страница его не объявляет');
        }
      }

      if (!dryRun && Object.keys(patch).length) {
        await doc.ref.update({ ...patch, updatedAt: Timestamp.now(), updatedBy: 'capture-script' });
      }
    } catch (error) {
      console.log(`   не вышло: ${(error as Error).message.split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('');
  console.log(dryRun ? 'Пробный прогон — ничего не записано.' : 'Готово.');
  console.log(`  скриншотов: ${shots}`);
  console.log(`  логотипов: ${logos}`);
}

capture()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Capture failed:', error);
    process.exit(1);
  });
