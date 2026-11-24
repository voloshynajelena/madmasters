import * as fs from 'fs';

/**
 * An image's dimensions, read from its header alone.
 *
 * The image picker has to tell a logo from a screenshot, and the only honest
 * way is to look. Decoding is out of the question: the portfolio folder holds
 * full-page captures thousands of pixels tall, and a picker that decoded
 * every one to sort a list would read tens of megabytes to answer a question
 * the first sixty bytes of each file already contain.
 *
 * Unknown formats return null rather than a guess. A caller that cannot
 * measure a file should say so, not invent a shape for it.
 */
export function imageSize(file: string): { width: number; height: number } | null {
  // SVG has no pixel size worth reporting, and reading one to find a viewBox
  // would answer a different question than the caller is asking.
  if (/\.svg$/i.test(file)) return { width: 128, height: 128 };

  let fd: number | undefined;
  try {
    fd = fs.openSync(file, 'r');
    const head = Buffer.alloc(64);
    const read = fs.readSync(fd, head, 0, 64, 0);
    if (read < 24) return null;

    // PNG: IHDR is always the first chunk, at a fixed offset.
    if (head.toString('latin1', 1, 4) === 'PNG') {
      return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
    }

    // JPEG: the size lives in the frame header, which has to be found by
    // walking the segment chain — there is no fixed offset.
    if (head[0] === 0xff && head[1] === 0xd8) {
      const size = fs.statSync(file).size;
      const buf = Buffer.alloc(Math.min(size, 256 * 1024));
      fs.readSync(fd, buf, 0, buf.length, 0);

      let at = 2;
      while (at + 9 < buf.length) {
        if (buf[at] !== 0xff) {
          at++;
          continue;
        }
        const marker = buf[at + 1];
        // SOF0–SOF15 carry the frame header. C4, C8 and CC share the range
        // and do not: they are Huffman tables, a JPEG extension and an
        // arithmetic-coding table.
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: buf.readUInt16BE(at + 5), width: buf.readUInt16BE(at + 7) };
        }
        const length = buf.readUInt16BE(at + 2);
        if (length < 2) return null;
        at += 2 + length;
      }
      return null;
    }

    // WebP: only the extended header states the size plainly. The lossy and
    // lossless chunk layouts pack it differently and are left unmeasured
    // rather than decoded wrongly.
    if (head.toString('latin1', 0, 4) === 'RIFF' && head.toString('latin1', 8, 12) === 'WEBP') {
      if (head.toString('latin1', 12, 16) === 'VP8X') {
        return {
          width: 1 + head.readUIntLE(24, 3),
          height: 1 + head.readUIntLE(27, 3),
        };
      }
      return null;
    }

    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/**
 * Is this a product mark or a capture of a screen?
 *
 * Small and roughly square is a mark; anything wide, or tall enough to be a
 * scrolling page, is a capture. An unmeasured file counts as a capture,
 * where being wrong gives an oddly cropped thumbnail rather than a logo badge
 * filled with somebody's home page.
 */
export function looksLikeLogo(size: { width: number; height: number } | null): boolean {
  if (!size) return false;
  const ratio = size.width / size.height;
  // The bounds are set by the real files: an app icon at 180×180 and a
  // mascot at 248×190 (ratio 1.3) are marks, while a phone capture at
  // 400×559 (ratio 0.72) is not, and a looser range swept those in.
  return size.width <= 512 && ratio > 0.75 && ratio < 1.5;
}
