'use client';

import { useEffect, useState } from 'react';

/**
 * Choosing the picture for a tile.
 *
 * A plain URL box would work and would be useless: the images that belong
 * here are the ones this site already ships, and nobody remembers
 * `/content/img/projects/femotion-logo.png`. So the box stays — any address
 * is still valid — with everything on disk offered beneath it.
 *
 * The list is filtered by what the slot is for. A logo slot leads with the
 * small square marks and a screenshot slot with the wide captures, because
 * putting a 1440×900 page capture in a 56px badge is the mistake this makes
 * easy to avoid.
 */

interface Image {
  url: string;
  width: number | null;
  height: number | null;
  kind: 'logo' | 'shot' | string;
}

let cache: Image[] | null = null;

export function ImageField({
  label,
  hint,
  value,
  onChange,
  prefer,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  prefer: 'logo' | 'shot';
}) {
  const [images, setImages] = useState<Image[] | null>(cache);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || images) return;
    fetch('/api/admin/portfolios/images')
      .then(r => (r.ok ? r.json() : { images: [] }))
      .then(d => {
        cache = d.images ?? [];
        setImages(cache);
      })
      .catch(() => setImages([]));
  }, [open, images]);

  // A changed address deserves a fresh attempt at loading it; without this a
  // single broken URL would leave the preview showing "not found" forever.
  useEffect(() => setFailed(false), [value]);

  const sorted = images
    ? [...images].sort((a, b) => {
        const score = (i: Image) => (i.kind === prefer ? 0 : 1);
        return score(a) - score(b) || a.url.localeCompare(b.url);
      })
    : [];

  return (
    <div>
      <span className="block text-xs font-medium text-text-muted mb-1">
        {label}
        {hint && <span className="font-normal"> — {hint}</span>}
      </span>

      <div className="flex items-start gap-2">
        <div
          className={`shrink-0 rounded-lg border border-border bg-surface overflow-hidden flex items-center justify-center ${
            prefer === 'logo' ? 'w-11 h-11' : 'w-20 h-[2.75rem]'
          }`}
        >
          {value && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              onError={() => setFailed(true)}
              className={prefer === 'logo' ? 'w-full h-full object-contain p-1' : 'w-full h-full object-cover object-top'}
            />
          ) : (
            <span className="text-[10px] text-text-muted px-1 text-center leading-tight">
              {failed ? 'not found' : 'none'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            value={value}
            placeholder="/content/img/… or https://"
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-text-muted/60 focus:border-accent outline-none transition-colors"
          />
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={() => setOpen(o => !o)}
              className="text-[11px] text-accent hover:text-accent-hover transition-colors"
            >
              {open ? 'Hide library' : 'Pick from library'}
            </button>
            {value && (
              <button
                onClick={() => onChange('')}
                className="text-[11px] text-text-muted hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface p-2">
          {images === null ? (
            <p className="text-[11px] text-text-muted px-1 py-2">Loading…</p>
          ) : sorted.length === 0 ? (
            <p className="text-[11px] text-text-muted px-1 py-2 leading-relaxed">
              No images found in <span className="font-mono">public/content/img</span>. Run{' '}
              <span className="font-mono">npx tsx scripts/capture-project-shots.ts</span> to take
              one from each project&rsquo;s live URL.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto grid grid-cols-4 gap-1.5">
              {sorted.map(image => (
                <button
                  key={image.url}
                  onClick={() => {
                    onChange(image.url);
                    setOpen(false);
                  }}
                  title={`${image.url}${image.width ? ` · ${image.width}×${image.height}` : ''}`}
                  className={`aspect-[4/3] rounded-md overflow-hidden border transition-colors ${
                    value === image.url
                      ? 'border-accent ring-1 ring-accent/40'
                      : 'border-border hover:border-accent/50'
                  } bg-surface-muted`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    className={
                      image.kind === 'logo'
                        ? 'w-full h-full object-contain p-1.5'
                        : 'w-full h-full object-cover object-top'
                    }
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
