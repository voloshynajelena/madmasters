import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase/admin';

/**
 * Upload an image for a portfolio tile or gallery.
 *
 * The other way to get a picture in — the library picker — only offers what
 * the repository ships, which means a screenshot taken by hand has to be
 * committed before it can be used. This is the path for everything else: a
 * crop of an app behind a login, a photo, a design mockup.
 *
 * Files go to Firebase Storage and come back as a download URL carrying a
 * token, which is how the Firebase SDKs serve public files. The alternative,
 * `makePublic()`, fails outright on a bucket with uniform bucket-level access
 * — the default for every bucket created since 2024 — so the token is the
 * form that actually works rather than the form that reads more simply.
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

/** Generous for a screenshot, small enough that a mis-picked video fails
 *  immediately rather than after a minute of uploading. */
const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/avif']);

/** A file name that survives a URL and a bucket listing. */
function safeName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.slice(-60) || 'image';
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File is larger than ${MAX_BYTES / 1024 / 1024} MB` },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: 'Images only — PNG, JPEG, WebP, SVG or AVIF' },
        { status: 400 },
      );
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set' },
        { status: 503 },
      );
    }

    const bucket = getAdminStorage().bucket(bucketName);

    // Checked up front so a missing bucket reports itself plainly. Without
    // this the upload fails deep inside the client library with a 404 about
    // an object, which reads as a bug in this route rather than as Storage
    // never having been turned on for the project.
    const [exists] = await bucket.exists();
    if (!exists) {
      return NextResponse.json(
        {
          error:
            `Firebase Storage is not set up: the bucket "${bucketName}" does not exist. ` +
            'Create it once in the Firebase console under Build → Storage → Get started, ' +
            'then uploads work with no further changes here.',
        },
        { status: 503 },
      );
    }

    const token = randomUUID();
    const objectPath = `portfolio/${Date.now()}-${safeName(file.name)}`;

    await bucket.file(objectPath).save(Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      metadata: {
        // The token is what makes the download URL below work; without it the
        // object is private and the URL returns 403.
        metadata: { firebaseStorageDownloadTokens: token },
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const url =
      `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/` +
      `${encodeURIComponent(objectPath)}?alt=media&token=${token}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Upload failed' },
      { status: 500 },
    );
  }
}
