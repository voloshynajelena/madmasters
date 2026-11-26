'use client';

import { useState } from 'react';

/**
 * The small form parts the builder is made of.
 *
 * Here rather than inline because the drawer and the profile panel need the
 * same ones, and a text input that looks different on two halves of the same
 * screen reads as a bug.
 */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-muted mb-1">
        {label}
        {hint && <span className="font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

const INPUT =
  'w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground ' +
  'placeholder:text-text-muted/60 focus:border-accent outline-none transition-colors';

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={INPUT}
    />
  );
}

export function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`${INPUT} resize-y leading-relaxed`}
    />
  );
}

/**
 * A list of short strings — a stack, a set of tags.
 *
 * Enter commits, comma commits, and backspace on an empty box takes back the
 * last chip, because that is what every tag field does and a field that
 * behaves differently costs more than it saves. Duplicates are dropped
 * case-insensitively: "React" and "react" on one portfolio is a typo, never
 * an intention.
 *
 * Typing offers what is already in use elsewhere. The vocabulary is not a
 * list somebody curated — it is every technology already named across these
 * projects, which is the only list guaranteed to spell things the way this
 * portfolio already spells them. Without it the same tool arrives as
 * "Node.js" on one project and "NodeJS" on the next.
 */
export function ChipInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState('');
  const [highlight, setHighlight] = useState(0);

  const taken = new Set(values.map(v => v.toLowerCase()));
  const query = draft.trim().toLowerCase();

  /** Prefix matches first: typing "n" means "Next.js" far more often than it
   *  means "Expo SDK 54 on Node". */
  const matches = query
    ? suggestions
        .filter(s => !taken.has(s.toLowerCase()) && s.toLowerCase().includes(query))
        .sort((a, b) => {
          const byPrefix =
            Number(b.toLowerCase().startsWith(query)) - Number(a.toLowerCase().startsWith(query));
          return byPrefix || a.length - b.length || a.localeCompare(b);
        })
        .slice(0, 6)
    : [];

  const commit = (raw: string) => {
    const clean = raw.trim().replace(/,$/, '').trim();
    setDraft('');
    setHighlight(0);
    if (!clean) return;
    if (taken.has(clean.toLowerCase())) return;
    onChange([...values, clean]);
  };

  return (
    <div className="relative rounded-lg bg-surface border border-border px-2 py-2 focus-within:border-accent transition-colors">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((value, i) => (
            <button
              key={`${value}-${i}`}
              onClick={() => onChange(values.filter((_, n) => n !== i))}
              title="Remove"
              className="group px-2 py-0.5 rounded bg-surface-hover text-xs text-foreground/80 hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              {value}
              <span className="ml-1 opacity-40 group-hover:opacity-100">×</span>
            </button>
          ))}
        </div>
      )}

      <input
        value={draft}
        placeholder={placeholder}
        onChange={e => {
          // A pasted "React, Redux, Node" becomes three chips rather than one
          // long one.
          if (e.target.value.includes(',')) {
            const parts = e.target.value.split(',');
            parts.slice(0, -1).forEach(commit);
            setDraft(parts[parts.length - 1]);
            return;
          }
          setDraft(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={e => {
          // Tab takes the suggestion, the way a shell completes a path. It
          // only steals the key when there is something to complete, so
          // tabbing out of a field that is offering nothing still moves on.
          if ((e.key === 'Tab' || e.key === 'ArrowRight') && matches[highlight] && !e.shiftKey) {
            if (e.key === 'ArrowRight' && e.currentTarget.selectionStart !== draft.length) return;
            e.preventDefault();
            commit(matches[highlight]);
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(matches[highlight] ?? draft);
            return;
          }
          if (e.key === 'ArrowDown' && matches.length) {
            e.preventDefault();
            setHighlight(h => (h + 1) % matches.length);
            return;
          }
          if (e.key === 'ArrowUp' && matches.length) {
            e.preventDefault();
            setHighlight(h => (h - 1 + matches.length) % matches.length);
            return;
          }
          if (e.key === 'Escape' && matches.length) {
            e.preventDefault();
            setDraft('');
            return;
          }
          if (e.key === 'Backspace' && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        // Not on blur: committing a half-typed word when the mouse goes to the
        // suggestion list would add "Nex" and then "Next.js".
        className="w-full bg-transparent px-1 text-sm text-foreground placeholder:text-text-muted/60 outline-none"
      />

      {matches.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-border bg-background shadow-lg overflow-hidden">
          {matches.map((match, i) => (
            <li key={match}>
              <button
                // `onMouseDown` rather than `onClick`: the input blurs first
                // on a click, and a blurred input closes this list before the
                // click lands.
                onMouseDown={e => {
                  e.preventDefault();
                  commit(match);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  i === highlight ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-surface-hover'
                }`}
              >
                {match}
              </button>
            </li>
          ))}
          <li className="px-3 py-1 border-t border-border text-[10px] text-text-muted">
            Tab to take it · Enter for what you typed
          </li>
        </ul>
      )}
    </div>
  );
}
