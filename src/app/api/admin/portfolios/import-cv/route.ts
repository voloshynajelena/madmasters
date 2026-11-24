import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';
import { cvFormatOf, extractCvText, parseCv } from '@/lib/cv-text';

/**
 * Read an uploaded CV and report what it appears to say.
 *
 * Nothing is stored and nothing is applied. The response is a set of
 * suggestions the builder shows for approval, because every field here is a
 * guess from an unstructured document and a wrong name on a portfolio is
 * worse than a blank one.
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

/** Big enough for any CV, small enough that a mis-picked file fails fast. */
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    const pasted = form.get('text');

    // The paste path is the fallback for anything the readers cannot handle —
    // a scanned PDF has no text in it to find, and no parser changes that.
    if (typeof pasted === 'string' && pasted.trim()) {
      return NextResponse.json({
        fileName: 'pasted text',
        ...parseCv(pasted.trim()),
      });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File is larger than ${MAX_BYTES / 1024 / 1024} MB` },
        { status: 400 },
      );
    }

    if (!cvFormatOf(file.name)) {
      return NextResponse.json(
        { error: 'Supported: .docx, .pdf, .txt, .md — or paste the text instead' },
        { status: 400 },
      );
    }

    const text = extractCvText(file.name, Buffer.from(await file.arrayBuffer()));

    if (!text.trim()) {
      return NextResponse.json(
        {
          error:
            'No text could be read from this file. Scans and PDFs without a text ' +
            'layer have none to find — paste the text instead.',
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ fileName: file.name, ...parseCv(text) });
  } catch (error) {
    console.error('Error importing CV:', error);
    return NextResponse.json({ error: 'Could not read the file' }, { status: 500 });
  }
}
