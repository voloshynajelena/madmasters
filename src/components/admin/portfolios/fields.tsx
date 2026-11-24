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
 */
export function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const clean = raw.trim().replace(/,$/, '').trim();
    if (!clean) return;
    if (values.some(v => v.toLowerCase() === clean.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...values, clean]);
    setDraft('');
  };

  return (
    <div className="rounded-lg bg-surface border border-border px-2 py-2 focus-within:border-accent transition-colors">
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
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(draft);
          } else if (e.key === 'Backspace' && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        className="w-full bg-transparent px-1 text-sm text-foreground placeholder:text-text-muted/60 outline-none"
      />
    </div>
  );
}
