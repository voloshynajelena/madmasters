import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as fs from 'fs';
import * as path from 'path';
import { getAdminAuth } from '@/lib/firebase/admin';
import { imageSize, looksLikeLogo } from '@/lib/image-size';

/**
 * The images this site already ships, so a tile can be given one by picking
 * rather than by typing a URL from memory.
 *
 * Read off disk rather than from a list in the database: the folder *is* the
 * list, a capture dropped into it by `scripts/capture-project-shots.ts`
 * appears without anything else being updated, and a database list would be
 * one more thing to keep in step.
 *
 * Each file is measured so the picker can lead with the right shape — wide
 * captures for a screenshot slot, small square marks for a logo slot.
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

const ROOTS = ['content/img/projects', 'content/img/fresh', 'content/img/portfolio'];
const EXTENSIONS = /\.(png|jpe?g|webp|svg|avif)$/i;

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const publicDir = path.join(process.cwd(), 'public');
    const images: { url: string; width: number | null; height: number | null; kind: string }[] = [];

    for (const root of ROOTS) {
      const dir = path.join(publicDir, root);
      if (!fs.existsSync(dir)) continue;

      for (const name of fs.readdirSync(dir)) {
        if (!EXTENSIONS.test(name)) continue;
        const size = imageSize(path.join(dir, name));
        images.push({
          url: `/${root}/${name}`,
          width: size?.width ?? null,
          height: size?.height ?? null,
          kind: looksLikeLogo(size) ? 'logo' : 'shot',
        });
      }
    }

    images.sort((a, b) => a.url.localeCompare(b.url));
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}
