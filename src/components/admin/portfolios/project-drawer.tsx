'use client';

import { useEffect, useState } from 'react';
import type { PortfolioItem, PortfolioItemBlocks } from '@/lib/firebase/types';
import { COMPONENT_LABELS } from './portfolio-preview';
import { ChipInput, Field, Input, Textarea } from './fields';
import { ImageField } from './image-field';

/**
 * A project's details, sliding in from the right.
 *
 * One drawer, opened from either side of the builder — the list on the left
 * and the "Details" link in the preview lead to the same place. Two drawers,
 * one to read and one to edit, would double the surface and make the preview
 * a lie about where the text comes from.
 *
 * Everything here edits the version's copy. "Reset from Projects KB" is the
 * only path back to the real record, and it is a button rather than a
 * background refresh because a portfolio already sent must not change under
 * its owner.
 */

const BLOCK_LABELS: { key: keyof PortfolioItemBlocks; label: string; hint: string }[] = [
  { key: 'description', label: 'Description', hint: 'The long text in the details panel' },
  { key: 'stack', label: 'Stack', hint: 'Technology chips on the card' },
  { key: 'components', label: 'Components', hint: 'Web, iOS, widget, extension…' },
  { key: 'decisions', label: 'Technical decisions', hint: 'What was chosen and why' },
  { key: 'highlights', label: 'Highlights', hint: 'Bullets you write for this application' },
  { key: 'links', label: 'Live link', hint: 'The product URL' },
];

interface Props {
  item: PortfolioItem;
  onChange: (next: PortfolioItem) => void;
  onClose: () => void;
  onReset: () => Promise<void>;
}

export function ProjectDrawer({ item, onChange, onClose, onReset }: Props) {
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Escape closes, which is what every drawer does and what a hand reaches
  // for before the mouse finds the corner.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof PortfolioItem>(key: K, value: PortfolioItem[K]) =>
    onChange({ ...item, [key]: value });

  const setBlock = (key: keyof PortfolioItemBlocks, value: boolean) =>
    onChange({ ...item, blocks: { ...item.blocks, [key]: value } });

  return (
    <>
      <div className="absolute inset-0 z-20 bg-black/30 animate-[fadeIn_150ms_ease-out]" onClick={onClose} />

      <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col animate-[slideIn_200ms_cubic-bezier(0.65,0,0.35,1)]">
        <header className="shrink-0 flex items-start gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground truncate">{item.name}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Copy for this portfolio · from{' '}
              <span className="font-mono">{item.projectKey}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={item.name} onChange={v => set('name', v)} />
            </Field>
            <Field label="Period">
              <Input value={item.period ?? ''} onChange={v => set('period', v)} placeholder="2026" />
            </Field>
          </div>

          <Field label="One-liner" hint="The line under the title on the card">
            <Input value={item.oneLiner} onChange={v => set('oneLiner', v)} />
          </Field>

          <Field label="Your role" hint="The KB describes projects, not what you did on them">
            <Input
              value={item.role ?? ''}
              onChange={v => set('role', v)}
              placeholder="Owner, tech lead"
            />
          </Field>

          <Field label="Description">
            <Textarea value={item.description} onChange={v => set('description', v)} rows={5} />
          </Field>

          <ImageField
            label="Screenshot"
            hint="the tile is mostly this"
            value={item.screenshot ?? ''}
            onChange={v => set('screenshot', v)}
            prefer="shot"
          />

          <ImageField
            label="Logo"
            hint="the badge on the tile"
            value={item.logo ?? item.thumbnail ?? ''}
            onChange={v => set('logo', v)}
            prefer="logo"
          />

          <Field label="Live URL">
            <Input value={item.liveUrl ?? ''} onChange={v => set('liveUrl', v)} placeholder="https://" />
          </Field>

          <Field label="Stack" hint="Enter to add, click to remove">
            <ChipInput values={item.stack} onChange={v => set('stack', v)} placeholder="Add a technology" />
          </Field>

          <Field label="Tags">
            <ChipInput values={item.tags} onChange={v => set('tags', v)} placeholder="Add a tag" />
          </Field>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Components
            </h3>
            {item.components.length === 0 ? (
              <p className="mt-2 text-xs text-text-muted">
                None recorded. Add them in Projects KB, then reset this item.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {item.components.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[11px] font-medium shrink-0">
                      {COMPONENT_LABELS[c.kind] ?? c.kind}
                    </span>
                    <span className="text-foreground truncate">{c.name}</span>
                    <button
                      onClick={() => set('components', item.components.filter((_, n) => n !== i))}
                      className="ml-auto shrink-0 text-xs text-text-muted hover:text-red-500 transition-colors"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Technical decisions
              </h3>
              <button
                onClick={() =>
                  set('decisions', [
                    ...item.decisions,
                    { title: '', choice: '', rationale: '', tradeoffs: '' },
                  ])
                }
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                + Add
              </button>
            </div>

            {item.decisions.length === 0 ? (
              <p className="mt-2 text-xs text-text-muted">
                None yet. These are what make a portfolio read like engineering rather than a list
                of tools.
              </p>
            ) : (
              <div className="mt-2 space-y-3">
                {item.decisions.map((d, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={d.title}
                        onChange={v => {
                          const next = [...item.decisions];
                          next[i] = { ...d, title: v };
                          set('decisions', next);
                        }}
                        placeholder="Decision"
                      />
                      <button
                        onClick={() => set('decisions', item.decisions.filter((_, n) => n !== i))}
                        className="shrink-0 text-xs text-text-muted hover:text-red-500 transition-colors"
                      >
                        remove
                      </button>
                    </div>
                    <Input
                      value={d.choice}
                      onChange={v => {
                        const next = [...item.decisions];
                        next[i] = { ...d, choice: v };
                        set('decisions', next);
                      }}
                      placeholder="What was chosen"
                    />
                    <Textarea
                      value={d.rationale}
                      onChange={v => {
                        const next = [...item.decisions];
                        next[i] = { ...d, rationale: v };
                        set('decisions', next);
                      }}
                      rows={2}
                      placeholder="Why it suits this case"
                    />
                    <Textarea
                      value={d.tradeoffs ?? ''}
                      onChange={v => {
                        const next = [...item.decisions];
                        next[i] = { ...d, tradeoffs: v };
                        set('decisions', next);
                      }}
                      rows={2}
                      placeholder="What it costs"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Highlights
              </h3>
              <button
                onClick={() => set('highlights', [...item.highlights, ''])}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                + Add
              </button>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Written for this application only — nothing in the KB corresponds to them.
            </p>
            <div className="mt-2 space-y-2">
              {item.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Textarea
                    value={h}
                    onChange={v => {
                      const next = [...item.highlights];
                      next[i] = v;
                      set('highlights', next);
                    }}
                    rows={2}
                    placeholder="Cut page weight by 60% by…"
                  />
                  <button
                    onClick={() => set('highlights', item.highlights.filter((_, n) => n !== i))}
                    className="shrink-0 mt-2 text-xs text-text-muted hover:text-red-500 transition-colors"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Shown on the page
            </h3>
            <div className="mt-2 space-y-1">
              {BLOCK_LABELS.map(({ key, label, hint }) => (
                <label
                  key={key}
                  className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.blocks[key]}
                    onChange={e => setBlock(key, e.target.checked)}
                    className="mt-0.5 accent-[#ff6b35]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">{label}</span>
                    <span className="block text-[11px] text-text-muted">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <footer className="shrink-0 px-5 py-3 border-t border-border">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted flex-1">
                Replace with the current KB record? Your highlights and visibility settings are
                kept; the rest is overwritten.
              </span>
              <button
                onClick={() => setConfirmReset(false)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setResetting(true);
                  await onReset();
                  setResetting(false);
                  setConfirmReset(false);
                }}
                disabled={resetting}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {resetting ? 'Resetting…' : 'Reset'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-text-muted hover:text-foreground transition-colors"
            >
              Reset from Projects KB
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}
