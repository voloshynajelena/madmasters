'use client';

import { useRef, useState } from 'react';
import type { PortfolioProfile } from '@/lib/firebase/types';

/**
 * Seeding the profile from a CV.
 *
 * The file never becomes the profile by itself. What the reader found is
 * listed with a checkbox each, and only what is ticked is applied — because
 * every one of those fields is a guess from an unstructured document, and a
 * guess that writes itself into a portfolio is a guess nobody checked.
 *
 * Fields that already have a value start unticked, so importing a second CV
 * into a tuned profile cannot quietly flatten it.
 */

interface Parsed {
  fileName: string;
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

type Key = 'fullName' | 'headline' | 'summary' | 'email' | 'phone' | 'location' | 'links' | 'stack';

const LABELS: Record<Key, string> = {
  fullName: 'Name',
  headline: 'Headline',
  summary: 'Summary',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  links: 'Links',
  stack: 'Stack',
};

interface Props {
  profile: PortfolioProfile;
  onApply: (patch: Partial<PortfolioProfile>, cv: { fileName: string; text: string }) => void;
}

export function CvImport({ profile, onApply }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'file' | 'paste'>('file');
  const [paste, setPaste] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [picked, setPicked] = useState<Set<Key>>(new Set());

  const send = async (body: FormData) => {
    try {
      setBusy(true);
      setError(null);
      const res = await fetch('/api/admin/portfolios/import-cv', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not read the file');

      setParsed(data);
      // Pre-tick only what would not overwrite something already written.
      const empty = new Set<Key>();
      const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v));
      (Object.keys(LABELS) as Key[]).forEach(key => {
        if (has(data[key]) && !has(profile[key])) empty.add(key);
      });
      setPicked(empty);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the file');
      setParsed(null);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!parsed) return;
    const patch: Partial<PortfolioProfile> = {};
    picked.forEach(key => {
      const value = parsed[key];
      if (value !== undefined) (patch as any)[key] = value;
    });
    onApply(patch, { fileName: parsed.fileName, text: parsed.text });
    setParsed(null);
    setPicked(new Set());
  };

  const preview = (key: Key): string => {
    if (!parsed) return '';
    const value = parsed[key];
    if (Array.isArray(value)) {
      return key === 'links'
        ? (value as { label: string }[]).map(l => l.label).join(', ')
        : (value as string[]).join(', ');
    }
    return String(value ?? '');
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Start from a CV
      </h3>
      <p className="mt-1 text-[11px] text-text-muted">
        Reads .docx and .pdf. Nothing is applied until you pick it.
      </p>

      <div className="mt-3 flex gap-1 p-0.5 rounded-lg bg-surface-muted w-fit">
        {(['file', 'paste'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === t ? 'bg-background text-foreground shadow-sm' : 'text-text-muted hover:text-foreground'
            }`}
          >
            {t === 'file' ? 'Upload' : 'Paste text'}
          </button>
        ))}
      </div>

      {tab === 'file' ? (
        <div className="mt-3">
          <input
            ref={fileInput}
            type="file"
            accept=".docx,.pdf,.txt,.md"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const body = new FormData();
              body.append('file', file);
              send(body);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="w-full px-3 py-6 rounded-lg border border-dashed border-border text-sm text-text-muted hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
          >
            {busy ? 'Reading…' : 'Choose a CV file'}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea
            value={paste}
            onChange={e => setPaste(e.target.value)}
            rows={5}
            placeholder="Paste the text of your CV"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-text-muted/60 focus:border-accent outline-none resize-y"
          />
          <button
            onClick={() => {
              const body = new FormData();
              body.append('text', paste);
              send(body);
            }}
            disabled={busy || !paste.trim()}
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {busy ? 'Reading…' : 'Read it'}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
      )}

      {parsed && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-muted">
            Found in <span className="text-foreground">{parsed.fileName}</span>. Ticked items
            will replace what is in the profile.
          </p>

          <div className="mt-2 space-y-1">
            {(Object.keys(LABELS) as Key[])
              .filter(key => preview(key))
              .map(key => {
                const occupied = Array.isArray(profile[key])
                  ? (profile[key] as unknown[]).length > 0
                  : Boolean(profile[key]);
                return (
                  <label
                    key={key}
                    className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={picked.has(key)}
                      onChange={e => {
                        const next = new Set(picked);
                        e.target.checked ? next.add(key) : next.delete(key);
                        setPicked(next);
                      }}
                      className="mt-0.5 accent-[#ff6b35]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{LABELS[key]}</span>
                        {occupied && (
                          <span className="text-[10px] px-1 py-px rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                            will overwrite
                          </span>
                        )}
                      </span>
                      <span className="block text-[11px] text-text-muted line-clamp-2">
                        {preview(key)}
                      </span>
                    </span>
                  </label>
                );
              })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={apply}
              disabled={picked.size === 0}
              className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              Apply {picked.size > 0 ? `${picked.size} field${picked.size > 1 ? 's' : ''}` : ''}
            </button>
            <button
              onClick={() => setParsed(null)}
              className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-foreground transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
