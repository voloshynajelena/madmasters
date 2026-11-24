'use client';

import { useEffect, useState } from 'react';

/**
 * Choosing pictures for a project.
 *
 * A plain URL box would work and would be useless: the images that belong
 * here are the ones this site already ships, and nobody remembers
 * `/content/img/projects/femotion-logo.png`. So the box stays — any address
 * is still valid — with everything on disk offered beneath it.
 *
 * The library is filtered by what the slot is for. A logo slot leads with the
 * small square marks and a screenshot slot with the wide captures, because
 * putting a 1440×900 page capture in a 56px badge is the mistake this makes
 * easy to avoid.
 */

interface LibraryImage {
  url: string;
  width: number | null;
  height: number | null;
  kind: 'logo' | 'shot' | string;
}

/** Fetched once per page load: the folder does not change under the user, and
 *  every slot in every drawer would otherwise ask for it again. */
let cache: LibraryImage[] | null = null;

function useLibrary(open: boolean) {
  const [images, setImages] = useState<LibraryImage[] | null>(cache);

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

  return images;
}

function ImageLibrary({
  prefer,
  selected,
  onPick,
}: {
  prefer: 'logo' | 'shot';
  selected?: string | string[];
  onPick: (url: string) => void;
}) {
  const images = useLibrary(true);
  const chosen = new Set(Array.isArray(selected) ? selected : selected ? [selected] : []);

  const sorted = images
    ? [...images].sort((a, b) => {
        const score = (i: LibraryImage) => (i.kind === prefer ? 0 : 1);
        return score(a) - score(b) || a.url.localeCompare(b.url);
      })
    : [];

  if (images === null) {
    return <p className="text-[11px] text-text-muted px-1 py-2">Loading…</p>;
  }

  if (sorted.length === 0) {
    return (
      <p className="text-[11px] text-text-muted px-1 py-2 leading-relaxed">
        No images found in <span className="font-mono">public/content/img</span>. Run{' '}
        <span className="font-mono">npx tsx scripts/capture-project-shots.ts</span> to take one
        from each project&rsquo;s live URL.
      </p>
    );
  }

  return (
    <div className="max-h-56 overflow-y-auto grid grid-cols-4 gap-1.5">
      {sorted.map(image => (
        <button
          key={image.url}
          onClick={() => onPick(image.url)}
          title={`${image.url}${image.width ? ` · ${image.width}×${image.height}` : ''}`}
          className={`aspect-[4/3] rounded-md overflow-hidden border transition-colors ${
            chosen.has(image.url)
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
  );
}

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
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  // A changed address deserves a fresh attempt at loading it; without this a
  // single broken URL would leave the preview showing "not found" forever.
  useEffect(() => setFailed(false), [value]);

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
              className={
                prefer === 'logo'
                  ? 'w-full h-full object-contain p-1'
                  : 'w-full h-full object-cover object-top'
              }
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
          <ImageLibrary
            prefer={prefer}
            selected={value}
            onPick={url => {
              onChange(url);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The extra pictures shown in the details panel.
 *
 * Ordered, because a gallery is a sequence and the first thing after the main
 * capture is the one most people will see. Reordering is arrows rather than
 * dragging: there are rarely more than a handful, and a drag target the size
 * of a thumbnail is harder to hit than a button.
 */
export function GalleryField({
  values,
  onChange,
  mainImage,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  /** Shown first and greyed, so it is clear the tile image leads the gallery
   *  and does not need adding again. */
  mainImage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const add = (value: string) => {
    const clean = value.trim();
    if (!clean || values.includes(clean)) return;
    onChange([...values, clean]);
    setUrl('');
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-text-muted">
          Gallery
          <span className="font-normal"> — more images in the details panel</span>
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-[11px] text-accent hover:text-accent-hover transition-colors"
        >
          {open ? 'Hide library' : 'Add from library'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {mainImage && (
          <div
            title="The tile image — always first in the gallery"
            className="relative aspect-[4/3] rounded-md overflow-hidden border border-border bg-surface-muted opacity-60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt="" className="w-full h-full object-cover object-top" />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5">
              tile
            </span>
          </div>
        )}

        {values.map((image, i) => (
          <div
            key={`${image}-${i}`}
            className="group relative aspect-[4/3] rounded-md overflow-hidden border border-border bg-surface-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              loading="lazy"
              title={image}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move left"
                className="w-5 h-5 rounded bg-white/15 text-white text-[10px] disabled:opacity-30 hover:bg-white/25"
              >
                ←
              </button>
              <button
                onClick={() => onChange(values.filter((_, n) => n !== i))}
                aria-label="Remove"
                className="w-5 h-5 rounded bg-red-500/80 text-white text-[10px] hover:bg-red-500"
              >
                ×
              </button>
              <button
                onClick={() => move(i, i + 1)}
                disabled={i === values.length - 1}
                aria-label="Move right"
                className="w-5 h-5 rounded bg-white/15 text-white text-[10px] disabled:opacity-30 hover:bg-white/25"
              >
                →
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setOpen(o => !o)}
          className="aspect-[4/3] rounded-md border border-dashed border-border text-text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center text-lg"
          aria-label="Add an image"
        >
          +
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface p-2 space-y-2">
          <ImageLibrary prefer="shot" selected={values} onPick={add} />
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <input
              value={url}
              placeholder="…or paste an address"
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add(url);
                }
              }}
              className="min-w-0 flex-1 px-2 py-1.5 rounded-md bg-background border border-border text-xs text-foreground placeholder:text-text-muted/60 focus:border-accent outline-none"
            />
            <button
              onClick={() => add(url)}
              disabled={!url.trim()}
              className="shrink-0 px-2.5 py-1.5 rounded-md bg-accent text-white text-[11px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
