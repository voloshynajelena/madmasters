/**
 * Build a tile from phone screenshots, or a square logo from a wordmark.
 *
 * Run with:
 *   npx tsx scripts/compose-image.ts tile <key> <img…> [--bg "#0f1629,#0a0f1e"] [--trim 0.06]
 *   npx tsx scripts/compose-image.ts logo <key> <img> [--bg "#1b2133"] [--zoom 1.6]
 *
 * A portfolio tile is 16:10 and a phone screenshot is roughly 9:19. Cropping
 * one to fit the other shows a sliver of its status bar, which is why every
 * app in the portfolio was wearing a picture of its own login screen: the
 * login screen is the only one that happens to be mostly empty space. Laying
 * the screens out on a landscape canvas is what a portfolio actually does,
 * and a browser is already here to do it.
 *
 * The logo mode exists for the same reason in miniature: an app's wordmark is
 * wide, and a 56px square badge needs something square. This puts the mark on
 * its own background with room around it instead of letterboxing it to
 * nothing.
 *
 * Nothing here invents artwork — it only arranges pictures the project
 * already has.
 */

import * as path from 'path';
import * as fs from 'fs';
import { chromium } from 'playwright';

const [mode, key, ...rest] = process.argv.slice(2);

const flag = (name: string): string | undefined => {
  const at = rest.indexOf(`--${name}`);
  return at === -1 ? undefined : rest[at + 1];
};

const images = rest.filter(a => !a.startsWith('--') && !/^[\d.]+$/.test(a) && !a.startsWith('#'));

const OUT_DIR = path.join(__dirname, '../public/content/img/projects');

/**
 * Render a page of local images and photograph it.
 *
 * The markup is written to a file beside the pictures and opened with
 * `goto`, rather than handed to `setContent`. A page created by `setContent`
 * has an opaque origin, and a `file://` image on it never loads — the first
 * attempt produced a handsome gradient with three broken-image icons
 * stretched into slivers on it.
 */
async function shoot(html: string, out: string, width: number, height: number, jpeg: boolean) {
  const scratch = path.join(OUT_DIR, `.compose-${Date.now()}.html`);
  fs.writeFileSync(scratch, html);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 2,
    });
    await page.goto(`file://${scratch}`);
    await page.waitForLoadState('networkidle');
    // Decoding finishes after load on large PNGs; without this the capture
    // can catch a half-painted image.
    await page.waitForTimeout(400);
    await page.screenshot(
      jpeg ? { path: out, type: 'jpeg', quality: 86 } : { path: out, type: 'png' },
    );
  } finally {
    await browser.close();
    fs.rmSync(scratch, { force: true });
  }
}

/** Images are referenced by name, relative to the page written beside them. */
function ref(p: string): string {
  return encodeURI(path.basename(p));
}

/**
 * Where the app window sits inside a desktop screen capture.
 *
 * Opened in a real browser because a browser already decodes PNG and already
 * has a canvas; writing a PNG decoder here to answer one question would be a
 * second implementation of something Chromium does correctly.
 *
 * The corner pixel is taken as the wallpaper. Anything differing from it by
 * more than a small tolerance is content, and the returned box is the extent
 * of that. A capture with no border around it simply returns its whole self.
 */
async function measureContent(
  files: string[],
): Promise<{ x: number; y: number; w: number; h: number; naturalWidth: number }[]> {
  const scratch = path.join(OUT_DIR, `.measure-${Date.now()}.html`);
  fs.writeFileSync(scratch, '<!doctype html><html><body></body></html>');

  // Chromium gives every `file://` document its own opaque origin, so a canvas
  // that has drawn a local image refuses `getImageData` as cross-origin. This
  // flag is what lets a page read a file sitting beside it. It is set only on
  // this throwaway browser, which loads nothing but these pictures.
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${scratch}`);

    const out: { x: number; y: number; w: number; h: number; naturalWidth: number }[] = [];
    for (const file of files) {
      out.push(
        (await page.evaluate(`(async () => {
          const img = new Image();
          img.src = ${JSON.stringify(ref(file))};
          await img.decode();

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const at = (x, y) => (y * width + x) * 4;
          const bg = [data[0], data[1], data[2]];
          const differs = (i) =>
            Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 24;

          // Counted per column and per row rather than "is any pixel here
          // different". A window's own chrome — the thin strip of tab marks
          // along the top — runs the full width of the capture, so a single
          // differing pixel was enough to declare the far edge content and
          // keep the wallpaper beside it. A column only counts when a real
          // share of its height is content, which a 25-pixel strip never is.
          const step = 4;
          const cols = new Array(width).fill(0);
          const rows = new Array(height).fill(0);

          for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
              if (!differs(at(x, y))) continue;
              cols[x]++;
              rows[y]++;
            }
          }

          const sampledRows = Math.ceil(height / step);
          const sampledCols = Math.ceil(width / step);
          const colFloor = sampledRows * 0.06;
          const rowFloor = sampledCols * 0.06;

          const firstAbove = (counts, floor) => counts.findIndex(c => c > floor);
          const lastAbove = (counts, floor) => {
            for (let i = counts.length - 1; i >= 0; i--) if (counts[i] > floor) return i;
            return -1;
          };

          const minX = firstAbove(cols, colFloor);
          const maxX = lastAbove(cols, colFloor);
          const minY = firstAbove(rows, rowFloor);
          const maxY = lastAbove(rows, rowFloor);

          if (maxX < 0) return { x: 0, y: 0, w: width, h: height, naturalWidth: width };
          return {
            x: minX, y: minY,
            w: Math.max(1, maxX - minX + 1),
            h: Math.max(1, maxY - minY + 1),
            naturalWidth: width,
          };
        })()`)) as any,
      );
    }
    return out;
  } finally {
    await browser.close();
    fs.rmSync(scratch, { force: true });
  }
}

async function composeTile() {
  const [from, to] = (flag('bg') ?? '#111a30,#070b16').split(',');
  const shots = images.slice(0, 3);
  if (!shots.length) throw new Error('No images given');

  // A screen capture taken on a desktop carries the desktop with it — a band
  // of wallpaper around the window, and rarely a symmetric one: the window
  // sits where it sat. Cropping a fixed fraction off each edge therefore
  // either leaves wallpaper on one side or eats the app on the other, which
  // is what the first two attempts did.
  //
  // So the bounds are measured instead of assumed. The browser has a decoder
  // and a canvas; it reads the corner pixel, takes that to be the wallpaper,
  // and returns the box of everything that differs from it.
  const bounds = await measureContent(shots);

  // The middle screen is the one a reader looks at, so it is the tallest and
  // sits in front; the other two are set back and turned slightly, which is
  // what makes three flat rectangles read as a group rather than a filmstrip.
  const cards = shots
    .map((img, i) => {
      const middle = shots.length === 1 || i === 1;
      const height = middle ? 78 : 66;
      const rotate = shots.length === 1 ? 0 : i === 0 ? -5 : i === 2 ? 5 : 0;
      const shift = shots.length === 1 ? 0 : i === 0 ? 26 : i === 2 ? -26 : 0;
      const b = bounds[i];

      return `<div style="
        height:${height}%; aspect-ratio:${b.w} / ${b.h}; overflow:hidden; position:relative;
        transform: rotate(${rotate}deg) translateX(${shift}px);
        z-index:${middle ? 3 : 1};
        border-radius:22px;
        border:1px solid rgba(255,255,255,.1);
        box-shadow:0 30px 70px rgba(0,0,0,.55);
      "><img src="${ref(img)}" style="
        position:absolute;
        width:${((b.naturalWidth / b.w) * 100).toFixed(3)}%;
        left:${((-b.x / b.w) * 100).toFixed(3)}%;
        top:${((-b.y / b.h) * 100).toFixed(3)}%;
      "></div>`;
    })
    .join('');

  const html = `<!doctype html><html><body style="margin:0">
    <div style="
      width:1440px; height:900px; display:flex; align-items:center;
      justify-content:center; gap:26px; overflow:hidden;
      background:
        radial-gradient(120% 90% at 50% -10%, rgba(255,255,255,.07), transparent 60%),
        linear-gradient(160deg, ${from}, ${to});
    ">${cards}</div>
  </body></html>`;

  const out = path.join(OUT_DIR, `${key}.jpg`);
  await shoot(html, out, 1440, 900, true);

  console.log(`плитка → /content/img/projects/${key}.jpg  (${Math.round(fs.statSync(out).size / 1024)} КБ)`);
}

async function composeLogo() {
  const bg = flag('bg') ?? '#1b2133';
  const zoom = Number.parseFloat(flag('zoom') ?? '1.5');
  const img = images[0];
  if (!img) throw new Error('No image given');

  const html = `<!doctype html><html><body style="margin:0">
    <div style="
      width:512px; height:512px; display:flex; align-items:center;
      justify-content:center; overflow:hidden; background:${bg};
    ">
      <img src="${ref(img)}" style="
        width:${Math.round(100 * zoom)}%; object-fit:contain;
      ">
    </div>
  </body></html>`;

  const out = path.join(OUT_DIR, `${key}-logo.png`);
  await shoot(html, out, 512, 512, false);

  console.log(`логотип → /content/img/projects/${key}-logo.png  (${Math.round(fs.statSync(out).size / 1024)} КБ)`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (mode === 'tile') await composeTile();
  else if (mode === 'logo') await composeLogo();
  else throw new Error('Usage: compose-image.ts tile|logo <key> <img…>');
  process.exit(0);
})().catch(e => {
  console.error(e.message);
  process.exit(1);
});
