/**
 * Reading a CV file well enough to prefill a portfolio.
 *
 * Only the text is wanted — never the layout — so this does not use a
 * document library. A `.docx` is a zip holding one XML file, and a `.pdf` is a
 * sequence of compressed streams holding text-drawing operators; both are
 * reachable with `zlib`, which Node already has. That matters here: this
 * repository already broke a build once by importing a package it had not
 * declared, and it currently reports 151 vulnerabilities from the packages it
 * does declare. A parser for two formats is not worth a third supply chain.
 *
 * What comes out is a suggestion, not an answer. `parseCv` guesses at a
 * summary and a stack from headings, and guesses are shown to the user for
 * approval rather than written anywhere. Nothing here decides anything.
 */

import { inflateRawSync, inflateSync } from 'zlib';

/* ------------------------------------------------------------------ zip --- */

/**
 * One file out of a zip archive, by name.
 *
 * Reads the central directory rather than scanning for local headers,
 * because a local header is allowed to carry zeroes for the sizes and put the
 * real ones in a trailing data descriptor — in which case there is no way to
 * know where the entry's data ends. The central directory always has them.
 */
function readZipEntry(buf: Buffer, wanted: string): Buffer | null {
  const EOCD_SIG = 0x06054b50;
  const CD_SIG = 0x02014b50;

  // The end-of-central-directory record is last, but a zip comment may follow
  // it, so it has to be searched for backwards. The comment is at most 65535
  // bytes, hence the bound.
  let eocd = -1;
  const lowest = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= lowest; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) return null;

  const entries = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  for (let i = 0; i < entries; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== CD_SIG) return null;

    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);

    if (name === wanted) {
      // The local header repeats the name and extra fields at its own
      // lengths, which need not match the central directory's — so they are
      // read again here rather than reused.
      const lNameLen = buf.readUInt16LE(localOffset + 26);
      const lExtraLen = buf.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + lNameLen + lExtraLen;
      const data = buf.subarray(start, start + compSize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      return null;
    }

    p += 46 + nameLen + extraLen + commentLen;
  }

  return null;
}

/* ----------------------------------------------------------------- xml --- */

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, name: string) => {
    const key = name.toLowerCase();
    if (ENTITIES[key]) return ENTITIES[key];
    if (key.startsWith('#x')) {
      const code = Number.parseInt(key.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    if (key.startsWith('#')) {
      const code = Number.parseInt(key.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return whole;
  });
}

/* ---------------------------------------------------------------- docx --- */

export function extractDocxText(buf: Buffer): string {
  const xml = readZipEntry(buf, 'word/document.xml');
  if (!xml) return '';

  return decodeEntities(
    xml
      .toString('utf8')
      // Structure first, while the tags that carry it are still there.
      .replace(/<w:tab\b[^>]*\/?>/g, '\t')
      .replace(/<w:br\b[^>]*\/?>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      // A numbered or bulleted paragraph keeps its marker in the numbering
      // definitions, not in the text, so list items arrive unmarked. A dash is
      // added so that "три года React" does not run into the next bullet.
      .replace(/<w:numPr\b[^>]*>[\s\S]*?<\/w:numPr>/g, '')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s*/g, '• ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ----------------------------------------------------------------- pdf --- */

/**
 * A font's `ToUnicode` table: the glyph code a PDF writes → the character a
 * reader sees.
 *
 * Without this a PDF produced by a word processor yields nothing readable.
 * Such a file does not store "Olena"; it stores the glyph indices of its
 * subsetted font, so the page above begins `<002400590049005B003C> Tj` and a
 * naive reader gets control characters. The mapping back to Unicode is in a
 * `/ToUnicode` stream, which is a small text format of its own.
 */
interface CMap {
  /** How many bytes one code takes — from the codespace range. */
  width: number;
  map: Map<number, string>;
}

function parseCMap(text: string): CMap {
  const map = new Map<number, string>();

  const space = /begincodespacerange([\s\S]*?)endcodespacerange/.exec(text);
  const firstCode = space ? /<([0-9a-f]+)>/i.exec(space[1])?.[1] : undefined;
  const width = firstCode ? Math.max(1, Math.ceil(firstCode.length / 2)) : 2;

  const chars = /beginbfchar([\s\S]*?)endbfchar/g;
  let block: RegExpExecArray | null;
  while ((block = chars.exec(text)) !== null) {
    const pairs = /<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi;
    let pair: RegExpExecArray | null;
    while ((pair = pairs.exec(block[1])) !== null) {
      map.set(Number.parseInt(pair[1], 16), utf16beToString(pair[2]));
    }
  }

  const ranges = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((block = ranges.exec(text)) !== null) {
    // Two forms: a range mapping to consecutive characters, and a range
    // mapping to an explicit list.
    const simple = /<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi;
    let row: RegExpExecArray | null;
    while ((row = simple.exec(block[1])) !== null) {
      const lo = Number.parseInt(row[1], 16);
      const hi = Number.parseInt(row[2], 16);
      const dst = Number.parseInt(row[3], 16);
      // A runaway range in a damaged file would otherwise allocate forever.
      for (let i = 0; i <= hi - lo && i < 0xffff; i++) {
        map.set(lo + i, String.fromCodePoint(dst + i));
      }
    }

    const listed = /<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*\[([^\]]*)\]/gi;
    while ((row = listed.exec(block[1])) !== null) {
      const lo = Number.parseInt(row[1], 16);
      const items = row[3].match(/<([0-9a-f]+)>/gi) ?? [];
      items.forEach((item, i) => {
        map.set(lo + i, utf16beToString(item.replace(/[<>]/g, '')));
      });
    }
  }

  return { width, map };
}

/** A `ToUnicode` destination is UTF-16BE, and may be several code units for
 *  one glyph — a ligature maps one code to "fi". */
function utf16beToString(hex: string): string {
  let out = '';
  for (let i = 0; i + 3 < hex.length + 1; i += 4) {
    const unit = Number.parseInt(hex.slice(i, i + 4), 16);
    if (Number.isFinite(unit)) out += String.fromCharCode(unit);
  }
  return out;
}

function decodeHexString(hex: string, cmap: CMap | undefined): string {
  const clean = hex.replace(/[^0-9a-f]/gi, '');
  const width = cmap?.width ?? 2;
  const step = width * 2;
  let out = '';
  for (let i = 0; i < clean.length; i += step) {
    const code = Number.parseInt(clean.slice(i, i + step), 16);
    if (!Number.isFinite(code)) continue;
    const mapped = cmap?.map.get(code);
    // With no table, a code is only trustworthy if it is already a character.
    out += mapped ?? (cmap ? '' : String.fromCharCode(code));
  }
  return out;
}

/** The text-showing operators, unescaped from a PDF string literal. */
function pdfString(raw: string): string {
  return raw.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (whole, code: string) => {
    switch (code) {
      case 'n': return '\n';
      case 'r': return '\r';
      case 't': return '\t';
      case 'b': return '\b';
      case 'f': return '\f';
      case '(': return '(';
      case ')': return ')';
      case '\\': return '\\';
      default: return String.fromCharCode(Number.parseInt(code, 8));
    }
  });
}

/** Every `stream ... endstream` payload in the file, decompressed. */
function* pdfStreams(buf: Buffer): Generator<{ at: number; text: string }> {
  const marker = Buffer.from('stream');
  const closer = Buffer.from('endstream');
  let at = 0;

  while (true) {
    const found = buf.indexOf(marker, at);
    if (found === -1) return;
    at = found + marker.length;

    // "endstream" also contains "stream"; skip it rather than treat its tail
    // as the start of a new one.
    if (found >= 3 && buf.toString('latin1', found - 3, found) === 'end') continue;

    let start = at;
    if (buf[start] === 0x0d) start++;
    if (buf[start] === 0x0a) start++;

    const end = buf.indexOf(closer, start);
    if (end === -1) return;

    const raw = buf.subarray(start, end);
    at = end;

    try {
      // Most streams are FlateDecode. zlib-wrapped is the norm; raw deflate
      // appears in files written by some generators.
      yield { at: found, text: inflateSync(raw).toString('latin1') };
    } catch {
      try {
        yield { at: found, text: inflateRawSync(raw).toString('latin1') };
      } catch {
        // Uncompressed streams exist and are worth trying, but a stream of
        // image bytes is not text and must not be dumped into the result.
        const plain = raw.toString('latin1');
        if (/\bTJ\b|\bTj\b|begincmap/.test(plain)) yield { at: found, text: plain };
      }
    }
  }
}

/**
 * Text out of a PDF.
 *
 * Two passes. The first collects the `ToUnicode` tables and works out which
 * resource name (`/F4`) each one belongs to, because the glyph code 0x0024
 * means different letters in different fonts and decoding with the wrong
 * table produces confident nonsense. The second reads the drawing operators —
 * `(text) Tj`, `<00240059> Tj`, `[(a) -20 (b)] TJ` — and the positioning
 * operators that imply a line break.
 *
 * This is not a full PDF implementation. It will not read a scanned page,
 * which has no text to read, and it will not reconstruct a multi-column
 * layout. For a CV exported from a word processor, which is the case this
 * exists for, it gets the words out in order.
 *
 * When it gets nothing useful it returns an empty string without complaint,
 * and the caller offers to take the text by paste instead.
 */
export function extractPdfText(buf: Buffer): string {
  const source = buf.toString('latin1');

  /* Pass 1 — the font tables, by object number. */
  const cmapsByObject = new Map<number, CMap>();
  for (const { at, text } of pdfStreams(buf)) {
    if (!/begincmap/.test(text)) continue;
    // The object number is the last "N 0 obj" before this stream.
    const header = source.slice(Math.max(0, at - 2000), at).match(/(\d+)\s+0\s+obj(?![\s\S]*\d+\s+0\s+obj)/);
    if (!header) continue;
    cmapsByObject.set(Number.parseInt(header[1], 10), parseCMap(text));
  }

  /* Pass 1b — which resource name uses which table.
   *
   * `/Font << /F4 123 0 R >>` names the font object; object 123 carries
   * `/ToUnicode 124 0 R`. Both links are followed by scanning the file text,
   * which is enough without a cross-reference table: this only has to work on
   * documents a word processor wrote, and those keep the dictionaries intact
   * and uncompressed.
   */
  const cmapByFontObject = new Map<number, CMap>();
  const fontObjects = /(\d+)\s+0\s+obj([\s\S]{0,1200}?)endobj/g;
  let obj: RegExpExecArray | null;
  while ((obj = fontObjects.exec(source)) !== null) {
    const toUnicode = /\/ToUnicode\s+(\d+)\s+0\s+R/.exec(obj[2]);
    if (!toUnicode) continue;
    const cmap = cmapsByObject.get(Number.parseInt(toUnicode[1], 10));
    if (cmap) cmapByFontObject.set(Number.parseInt(obj[1], 10), cmap);
  }

  const cmapByName = new Map<string, CMap>();
  const fontDicts = /\/Font\s*<<([\s\S]{0,2000}?)>>/g;
  let dict: RegExpExecArray | null;
  while ((dict = fontDicts.exec(source)) !== null) {
    const refs = /\/(\w+)\s+(\d+)\s+0\s+R/g;
    let ref: RegExpExecArray | null;
    while ((ref = refs.exec(dict[1])) !== null) {
      const cmap = cmapByFontObject.get(Number.parseInt(ref[2], 10));
      if (cmap) cmapByName.set(ref[1], cmap);
    }
  }

  /* Pass 2 — the words, grouped into lines by where they sit on the page.
   *
   * The obvious rule — a positioning operator ends the line — is wrong for
   * exactly the documents this has to read. A word processor emits one
   * `BT … Tj … ET` block per *glyph*, each with its own `Td`, so that rule
   * yields "O l e n a". What actually separates lines is the vertical
   * coordinate, so fragments are collected with their y and grouped at the
   * end. Spaces need no reconstruction: they are real glyphs with their own
   * code, which the `ToUnicode` table maps back to U+0020.
   */
  /* Laid out one content stream at a time, never pooled.
   *
   * A content stream is a page, and every page starts its coordinates again
   * from the same origin. Pooling them puts page 1 line 6 and page 2 line 6
   * at the same height, and the two pages come out interleaved a line at a
   * time — which reads exactly like a two-column layout and was mistaken for
   * one until the page count was checked.
   */
  const pages: string[] = [];

  for (const { text } of pdfStreams(buf)) {
    if (!/\bTJ\b|\bTj\b/.test(text)) continue;

    const fragments: Fragment[] = [];

    const ops =
      /\bq\b|\bQ\b|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(cm|Tm)\b|(-?[\d.]+)\s+(-?[\d.]+)\s+(Td|TD)\b|\bT\*|\/(\w+)\s+([\d.]+)\s+Tf|\((?:\\.|[^\\()])*\)\s*Tj|<[0-9a-fA-F\s]*>\s*Tj|\[(?:\\.|[^\\\]])*\]\s*TJ/g;

    let match: RegExpExecArray | null;
    let cmap: CMap | undefined;

    // The graphics state, only as far as it affects where text lands.
    let ctm = { sy: 1, ty: 0, sx: 1, tx: 0 };
    const stack: (typeof ctm)[] = [];
    let tm = { sy: 1, ty: 0, tx: 0 };
    let td = { x: 0, y: 0 };

    let fontSize = 12;

    const place = (chunk: string) => {
      if (!chunk) return;
      const y = ctm.ty + ctm.sy * (tm.ty + td.y);
      const x = ctm.tx + ctm.sx * (tm.tx + td.x);
      // The size on the page, not in text space: a 32pt heading inside a
      // 0.75 scale draws at 24, and the gap that separates its letters
      // scales with it.
      fragments.push({ y, x, size: Math.abs(fontSize * ctm.sx * tm.sy) || 12, text: chunk });
    };

    while ((match = ops.exec(text)) !== null) {
      const op = match[0];

      if (op === 'q') { stack.push({ ...ctm }); continue; }
      if (op === 'Q') { ctm = stack.pop() ?? ctm; continue; }

      if (match[7] === 'cm') {
        // Composed rather than replaced: nested `q … cm … Q` blocks are how a
        // page positions each paragraph.
        const sx = Number.parseFloat(match[1]);
        const sy = Number.parseFloat(match[4]);
        ctm = {
          sx: ctm.sx * sx,
          sy: ctm.sy * sy,
          tx: ctm.tx + ctm.sx * Number.parseFloat(match[5]),
          ty: ctm.ty + ctm.sy * Number.parseFloat(match[6]),
        };
        continue;
      }

      if (match[7] === 'Tm') {
        tm = { sy: Number.parseFloat(match[4]), ty: Number.parseFloat(match[6]), tx: Number.parseFloat(match[5]) };
        td = { x: 0, y: 0 };
        continue;
      }

      if (match[10] === 'Td' || match[10] === 'TD') {
        td = { x: td.x + Number.parseFloat(match[8]), y: td.y + Number.parseFloat(match[9]) };
        continue;
      }

      if (op === 'T*') { td = { x: td.x, y: td.y - 12 }; continue; }

      if (/Tf$/.test(op)) {
        cmap = cmapByName.get(match[11]);
        fontSize = Number.parseFloat(match[12]) || fontSize;
        continue;
      }

      if (/Tj$/.test(op)) {
        place(
          op.trimStart().startsWith('<')
            ? decodeHexString(op.slice(op.indexOf('<') + 1, op.lastIndexOf('>')), cmap)
            : pdfString(op.slice(op.indexOf('(') + 1, op.lastIndexOf(')'))),
        );
        continue;
      }

      if (/TJ$/.test(op)) {
        const inner = op.slice(op.indexOf('[') + 1, op.lastIndexOf(']'));
        const parts = inner.match(/\((?:\\.|[^\\()])*\)|<[0-9a-fA-F\s]*>|-?[\d.]+/g) ?? [];
        let chunk = '';
        for (const part of parts) {
          if (part.startsWith('(')) {
            chunk += pdfString(part.slice(1, -1));
          } else if (part.startsWith('<')) {
            chunk += decodeHexString(part.slice(1, -1), cmap);
          } else if (Number.parseFloat(part) < -100) {
            // A large negative kern is how a PDF writes a space between runs.
            chunk += ' ';
          }
        }
        place(chunk);
      }
    }

    const page = layOutFragments(fragments);
    if (page) pages.push(page);
  }

  return pages.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

type Fragment = { y: number; x: number; size: number; text: string };

/** A horizontal run of text on one line: what a person would call a line, in
 *  one column of the page. */
type Run = { y: number; x: number; text: string };

/**
 * Where a page splits into columns, or null when it does not.
 *
 * A CV with a sidebar is the common case and the one that breaks naive
 * extraction: the sidebar's "Contact" and the main column's "Summary" sit at
 * the same height, so reading by row produces "Contact Summary" and then
 * drops a phone number into the middle of a job description. The giveaway is
 * a vertical corridor almost no text occupies.
 *
 * Almost, not entirely. Requiring a strictly empty corridor finds nothing on
 * a real document — a long sidebar line reaches into the gap, and a handful
 * of glyphs land there. So this looks for a valley rather than a void: an
 * interior band holding a small fraction of what the busy parts hold, with
 * substantial content on both sides of it. A single-column page has no such
 * valley, and gets no split.
 */
function findColumnSplit(runs: Run[]): number | null {
  if (runs.length < 12) return null;

  const xs = runs.map(r => r.x);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const span = max - min;
  if (span < 80) return null;

  const BINS = 30;
  const counts = new Array<number>(BINS).fill(0);
  for (const x of xs) {
    counts[Math.min(BINS - 1, Math.floor(((x - min) / span) * BINS))]++;
  }

  const busy = counts.filter(c => c > 0).sort((a, b) => a - b);
  const median = busy[Math.floor(busy.length / 2)] ?? 0;
  if (!median) return null;

  const total = runs.length;
  let best: { at: number; count: number } | null = null;

  // The interior only: a gap at either edge is a margin, not a corridor.
  for (let i = Math.floor(BINS * 0.15); i < Math.floor(BINS * 0.85); i++) {
    if (counts[i] > median * 0.25) continue;

    const left = counts.slice(0, i).reduce((a, b) => a + b, 0);
    if (left < total * 0.12 || total - left - counts[i] < total * 0.12) continue;

    if (!best || counts[i] < best.count) {
      best = { at: min + ((i + 0.5) / BINS) * span, count: counts[i] };
    }
  }

  return best?.at ?? null;
}

/**
 * Fragments back into readable text.
 *
 * Three steps, in this order for a reason. Fragments become lines by vertical
 * position; each line is cut into runs wherever a horizontal gap is too wide
 * to be a space; only then are runs assigned to columns. Assigning individual
 * glyphs to columns instead would tear "Location: Calgary, AB, Canada" in
 * half the moment it reached past the corridor, which it does.
 */
function layOutFragments(fragments: Fragment[]): string {
  if (!fragments.length) return '';

  const ys = fragments.map(f => f.y);
  const descending = ys[0] > ys[ys.length - 1];

  const lines = new Map<number, Fragment[]>();
  for (const fragment of fragments) {
    // 2 units of tolerance: smaller splits a styled word off its line, larger
    // merges a tight table's rows.
    const key = Math.round(fragment.y / 2) * 2;
    const bucket = lines.get(key) ?? [];
    bucket.push(fragment);
    lines.set(key, bucket);
  }

  const runs: Run[] = [];

  for (const [y, bucket] of lines) {
    const sorted = bucket.sort((a, b) => a.x - b.x);
    let text = '';
    let startX = sorted[0].x;
    let lastEnd = sorted[0].x;

    for (const fragment of sorted) {
      // The gap is measured from where the previous fragment *ended*, which
      // has to be estimated: a PDF records where text starts, never how wide
      // it was. Half an em per character is close enough for the proportional
      // faces a CV uses. Comparing starts instead — the obvious reading —
      // makes a five-letter run look like a five-letter gap, and tore
      // "Olena Voloshyna" into three pieces.
      //
      // The threshold scales with the type: a 24pt heading puts more space
      // between two words than a 9pt caption does between two columns.
      const gutter = Math.max(8, fragment.size * 0.8);
      if (text && fragment.x - lastEnd > gutter) {
        runs.push({ y, x: startX, text: text.trim() });
        text = '';
        startX = fragment.x;
      }
      text += fragment.text;
      lastEnd = fragment.x + fragment.text.length * fragment.size * 0.5;
    }

    if (text.trim()) runs.push({ y, x: startX, text: text.trim() });
  }

  return splitColumns(runs, 0)
    .map(group =>
      group
        .sort((a, b) => (descending ? b.y - a.y : a.y - b.y) || a.x - b.x)
        .map(r => r.text.replace(/[ \t]+/g, ' ').trim())
        .filter(Boolean)
        .join('\n'),
    )
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Columns, to a limited depth.
 *
 * One level is almost always the whole story — a sidebar beside a body. The
 * limit is what stops a single column of prose from being minced by an
 * unlucky run of ragged line starts, and the cost of over-splitting is not
 * symmetric: a missed column interleaves two readable halves, while a
 * phantom column scatters a wide heading across groups and loses the name at
 * the top of the CV. So this stays shallow deliberately.
 */
function splitColumns(runs: Run[], depth: number): Run[][] {
  if (depth >= 1) return [runs];

  const split = findColumnSplit(runs);
  if (split === null) return [runs];

  // Each column is read to its end before the next begins, which is how a
  // person reads a sidebar CV and how `parseCv` needs to see it: a heading
  // only delimits a section if that section's own lines follow it
  // uninterrupted.
  return [
    ...splitColumns(runs.filter(r => r.x < split), depth + 1),
    ...splitColumns(runs.filter(r => r.x >= split), depth + 1),
  ];
}

/* ------------------------------------------------------------ dispatch --- */

export type CvFormat = 'docx' | 'pdf' | 'text';

export function cvFormatOf(filename: string): CvFormat | null {
  const name = filename.toLowerCase();
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.txt') || name.endsWith('.md')) return 'text';
  return null;
}

export function extractCvText(filename: string, buf: Buffer): string {
  switch (cvFormatOf(filename)) {
    case 'docx': return extractDocxText(buf);
    case 'pdf': return extractPdfText(buf);
    case 'text': return buf.toString('utf8').trim();
    default: return '';
  }
}

/* --------------------------------------------------------------- parse --- */

export interface ParsedCv {
  fullName?: string;
  headline?: string;
  summary?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: { label: string; url: string }[];
  stack: string[];
  text: string;
}

/** Headings a CV uses for the paragraph about the person. */
const SUMMARY_HEADINGS = /^(professional\s+)?(summary|profile|about( me)?|objective|overview|introduction)\s*:?\s*$/i;
/** Headings a CV uses for the list of technologies. */
const SKILLS_HEADINGS = /^(technical\s+|core\s+|key\s+)?(skills|technologies|tech\s+stack|stack|competenc(y|ies)|expertise|toolset|tools)\s*:?\s*$/i;
/** Any other heading — where a section stops. */
const ANY_HEADING = /^[A-Z][A-Za-z /&-]{2,40}\s*:?\s*$/;

function sectionAfter(lines: string[], heading: RegExp): string[] {
  const start = lines.findIndex(l => heading.test(l.trim()));
  if (start === -1) return [];
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      // A blank line inside a section is fine; a blank line after the section
      // already has content and before a heading is where it ends.
      if (body.length && ANY_HEADING.test((lines[i + 1] ?? '').trim())) break;
      continue;
    }
    if (ANY_HEADING.test(line) && body.length) break;
    body.push(line);
  }
  return body;
}

/**
 * Pull the obvious facts out of a CV.
 *
 * Everything is optional and everything is a guess. A CV has no schema, so
 * the only honest contract is that a field is present when the heuristic
 * matched something and absent when it did not — never a filled-in default,
 * because a wrong name on a portfolio is worse than a blank one.
 */
export function parseCv(text: string): ParsedCv {
  const lines = text.split('\n');

  // The top of each block, not just the top of the document. A CV with a
  // sidebar puts "Contact / Phone / E-mail" first and the person's name at
  // the head of the *next* block, so looking only at the first lines of the
  // file finds a phone number where the name should be.
  const head = text
    .split(/\n\s*\n/)
    .flatMap(block => block.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 8));

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)?.[0];
  const phone = text.match(/\+?\d[\d\s().-]{8,18}\d/)?.[0]?.trim();

  const links: { label: string; url: string }[] = [];
  const seen = new Set<string>();
  for (const raw of text.match(/https?:\/\/[^\s<>()[\]",]+|(?:www\.|linkedin\.com|github\.com)[^\s<>()[\]",]+/gi) ?? []) {
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    const clean = url.replace(/[.,;:]+$/, '');
    if (seen.has(clean.toLowerCase())) continue;
    seen.add(clean.toLowerCase());
    const host = clean.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const label =
      /linkedin\./i.test(host) ? 'LinkedIn'
      : /github\./i.test(host) ? 'GitHub'
      : host;
    links.push({ label, url: clean });
  }

  // The name is the first line that looks like a name rather than a contact
  // detail: two or three capitalised words, no digits, no @.
  const fullName = head.find(l =>
    /^[\p{Lu}][\p{L}'-]+(?:\s+[\p{Lu}][\p{L}'-]+){1,2}$/u.test(l) && !/\d|@/.test(l),
  );

  // The headline is the line right after the name, when it is short and is not
  // a contact detail.
  const nameAt = fullName ? head.indexOf(fullName) : -1;
  const after = nameAt >= 0 ? head[nameAt + 1] : undefined;
  const headline =
    after && after.length <= 90 && !/@|\+?\d{6,}|https?:/i.test(after) ? after : undefined;

  const summaryLines = sectionAfter(lines, SUMMARY_HEADINGS);
  const summary = summaryLines.length ? summaryLines.join(' ').replace(/\s+/g, ' ').trim() : undefined;

  const skillLines = sectionAfter(lines, SKILLS_HEADINGS);
  const stack = Array.from(
    new Set(
      skillLines
        .join(', ')
        // A skills section is written with commas, bullets, slashes or pipes,
        // and often with a "Frontend:" label in front of each run.
        .replace(/^[^:]{0,24}:\s*/gm, '')
        .split(/[,;|•·]|\s{2,}/)
        .map(s => s.replace(/^[-–—\s]+|[.\s]+$/g, '').trim())
        .filter(s => s.length >= 2 && s.length <= 32 && !/^\d+$/.test(s)),
    ),
  ).slice(0, 40);

  // A labelled location is worth far more than a guessed one, and CVs usually
  // label it. The unlabelled fallback requires the line to *start* with a
  // letter, because "- JavaScript, Typescript" is also two words round a
  // comma and was being read as a city.
  const labelled = /(?:^|\n|\s)Location\s*:\s*([^\n]+)/i.exec(text)?.[1]?.trim();
  const location =
    labelled?.slice(0, 64) ??
    head.find(
      l =>
        /^\p{Lu}[\p{L}\s.'-]*,\s*\p{Lu}[\p{L}\s.'-]*$/u.test(l) &&
        l.length <= 48 &&
        l !== fullName &&
        l !== headline,
    );

  return { fullName, headline, summary, email, phone, location, links, stack, text };
}
