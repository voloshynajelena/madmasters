'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { PortfolioItem, PortfolioProfile, PortfolioVersion } from '@/lib/firebase/types';
import { PortfolioPreview } from './portfolio-preview';
import { ProjectDrawer } from './project-drawer';
import { VisitorDetails } from './visitor-details';
import { CvImport } from './cv-import';
import { ChipInput, Field, Input, Textarea } from './fields';

/**
 * The portfolio builder: edit on the left, the page itself on the right.
 *
 * The preview is the real component, fed the live draft — not a mock-up of
 * it. Anything that looks wrong on the right is wrong, which is the only
 * version of a preview worth having.
 *
 * All editing happens on a local draft and is written in one PATCH. A field
 * that saved on every keystroke would turn a reworded summary into forty
 * writes and make Ctrl+Z meaningless, so the price is an explicit Save and an
 * unsaved-changes guard.
 */

interface Props {
  initial: PortfolioVersion;
}


/**
 * The link that goes on a résumé.
 *
 * Switched off until somebody switches it on, and said plainly rather than
 * hinted at: the page carries a phone number and an email, and anyone who
 * has the address can open it. "Unlisted" is the protection — the page asks
 * search engines not to index it — and that only holds if the owner knows
 * that is all it is.
 *
 * The address cannot be copied before it is saved, because until the save
 * comes back the server has not agreed to it: another portfolio may already
 * hold the same one.
 */
function SharePanel({
  share,
  onChange,
  copied,
  onCopied,
  dirty,
}: {
  share: { enabled: boolean; slug: string };
  onChange: (next: { enabled: boolean; slug: string }) => void;
  copied: boolean;
  onCopied: () => void;
  dirty: boolean;
}) {
  const url = share.slug ? `https://madmasters.pro/p/${share.slug}` : '';

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={share.enabled}
          onChange={e => onChange({ ...share, enabled: e.target.checked })}
          className="mt-0.5 accent-[#ff6b35]"
        />
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Public link
          </span>
          <span className="block mt-1 text-[11px] text-text-muted leading-relaxed">
            Anyone with the address can open this portfolio without signing in. It is not listed
            anywhere and asks not to be indexed — but it is not secret, and it shows the phone
            number and email above.
          </span>
        </span>
      </label>

      {share.enabled && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-xs text-text-muted">madmasters.pro/p/</span>
            <input
              value={share.slug}
              placeholder="olena-voloshyna"
              onChange={e => onChange({ ...share, slug: e.target.value })}
              className="min-w-0 flex-1 px-2 py-1.5 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-text-muted/60 focus:border-accent outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                onCopied();
              }}
              disabled={!url || dirty}
              title={dirty ? 'Save first — the address is settled on the server' : url}
              className="px-2.5 py-1.5 rounded-lg bg-accent text-white text-[11px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            {url && !dirty && (
              <a
                href={`/p/${share.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-accent hover:text-accent-hover transition-colors"
              >
                Open it
              </a>
            )}
            {dirty && <span className="text-[11px] text-text-muted">Save to settle the address</span>}
          </div>
        </div>
      )}
    </section>
  );
}

export function PortfolioBuilder({ initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [targetRole, setTargetRole] = useState(initial.targetRole ?? '');
  const [targetCompany, setTargetCompany] = useState(initial.targetCompany ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [status, setStatus] = useState(initial.status ?? 'draft');
  const [profile, setProfile] = useState<PortfolioProfile>(initial.profile);
  const [items, setItems] = useState<PortfolioItem[]>(
    [...(initial.items ?? [])].sort((a, b) => a.order - b.order),
  );
  const [cv, setCv] = useState(initial.cv);
  const [share, setShare] = useState(initial.share ?? { enabled: false, slug: '' });
  const [copied, setCopied] = useState(false);

  const [tab, setTab] = useState<'profile' | 'projects'>('profile');
  /**
   * Which project is open, and in which of the two panels.
   *
   * `visitor` is what the portfolio itself does — click a tile, the details
   * slide in from the right. `edit` is the owner's form. They are never open
   * at once: both occupy the same edge of the screen, and stacking them would
   * leave no way to tell which one a change belonged to.
   */
  const [open, setOpen] = useState<{ key: string; mode: 'visitor' | 'edit' } | null>(null);
  const openKey = open?.key ?? null;
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [missing, setMissing] = useState<{ projectKey: string; name: string }[]>([]);

  // Compared against the draft to know whether there is anything to save, and
  // to warn before the tab closes on unsaved work.
  const saved = useRef(JSON.stringify({ name, targetRole, targetCompany, notes, status, profile, items, share }));
  const draft = JSON.stringify({ name, targetRole, targetCompany, notes, status, profile, items, share });
  const dirty = draft !== saved.current;

  const save = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const body = { name, targetRole, targetCompany, notes, status, profile, items, cv, share };
      const res = await fetch(`/api/admin/portfolios/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Failed to save');
      // The token is minted by the server on the first share, so the address
      // only exists here after a save has come back.
      if (result.share) setShare(result.share);
      saved.current = JSON.stringify({ name, targetRole, targetCompany, notes, status, profile, items, share: result.share ?? share });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [initial.id, name, targetRole, targetCompany, notes, status, profile, items, cv, share]);

  // Cmd/Ctrl+S saves, because this is a document and that is what hands do.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty && !saving) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, saving, save]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Which projects exist in the KB but not in this version — checked once, so
  // a version made before a project existed can pick it up.
  useEffect(() => {
    fetch(`/api/admin/portfolios/${initial.id}/resync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(d => d?.missing && setMissing(d.missing))
      .catch(() => {});
  }, [initial.id]);

  const openItem = useMemo(() => items.find(i => i.projectKey === openKey) ?? null, [items, openKey]);

  const updateItem = (next: PortfolioItem) =>
    setItems(list => list.map(i => (i.projectKey === next.projectKey ? next : i)));

  const move = (key: string, to: number) => {
    setItems(list => {
      const sorted = [...list].sort((a, b) => a.order - b.order);
      const from = sorted.findIndex(i => i.projectKey === key);
      if (from === -1 || to < 0 || to >= sorted.length || from === to) return list;
      const [moved] = sorted.splice(from, 1);
      sorted.splice(to, 0, moved);
      return sorted.map((item, order) => ({ ...item, order }));
    });
  };

  const resetItem = async (projectKey: string) => {
    try {
      const res = await fetch(`/api/admin/portfolios/${initial.id}/resync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectKey }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to reset');
      updateItem((await res.json()).item);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset');
    }
  };

  const addMissing = async () => {
    try {
      const res = await fetch(`/api/admin/portfolios/${initial.id}/resync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addMissing: true }),
      });
      if (!res.ok) throw new Error('Failed to add');
      setItems((await res.json()).items);
      setMissing([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add');
    }
  };

  const ordered = [...items].sort((a, b) => a.order - b.order);
  const shownCount = ordered.filter(i => i.enabled).length;

  return (
    // The admin shell pads its content and, below `lg`, puts a fixed 64px
    // header above it. Both are cancelled here so the builder owns the whole
    // viewport: a split screen that scrolls the page as well as its two panes
    // is unusable.
    <div className="-m-6 lg:-m-8 flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      <header className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-border bg-background">
        <Link
          href="/admin/portfolios"
          className="shrink-0 text-text-muted hover:text-foreground transition-colors"
          aria-label="Back to portfolios"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-foreground outline-none focus:bg-surface rounded px-2 py-1 -ml-2 transition-colors"
        />

        <select
          value={status}
          onChange={e => setStatus(e.target.value as 'draft' | 'ready')}
          className="shrink-0 px-2 py-1.5 rounded-lg bg-surface border border-border text-xs text-foreground outline-none focus:border-accent"
        >
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
        </select>

        <span className="shrink-0 text-xs text-text-muted tabular-nums">
          {saving ? 'Saving…' : dirty ? 'Unsaved' : savedAt ? `Saved ${savedAt}` : 'Saved'}
        </span>

        <button
          onClick={save}
          disabled={saving || !dirty}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
        >
          Save
        </button>
      </header>

      {error && (
        <div className="shrink-0 px-5 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        {/* ------------------------------------------------------- editor -- */}
        <div className="w-[420px] shrink-0 flex flex-col border-r border-border bg-surface-muted">
          <div className="shrink-0 flex gap-1 p-2 border-b border-border">
            {(['profile', 'projects'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  tab === t
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                {t}
                {t === 'projects' && (
                  <span className="ml-1.5 text-text-muted">
                    {shownCount}/{ordered.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {tab === 'profile' ? (
              <>
                <CvImport
                  profile={profile}
                  onApply={(patch, source) => {
                    setProfile(p => ({ ...p, ...patch }));
                    setCv({ ...source, importedAt: new Date().toISOString() });
                  }}
                />
                {cv && (
                  <p className="text-[11px] text-text-muted -mt-2">
                    Seeded from <span className="text-foreground">{cv.fileName}</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role">
                    <Input value={targetRole} onChange={setTargetRole} placeholder="Senior Frontend" />
                  </Field>
                  <Field label="Company">
                    <Input value={targetCompany} onChange={setTargetCompany} placeholder="Shopify" />
                  </Field>
                </div>

                <Field label="Full name">
                  <Input value={profile.fullName} onChange={v => setProfile(p => ({ ...p, fullName: v }))} />
                </Field>
                <Field label="Headline">
                  <Input
                    value={profile.headline}
                    onChange={v => setProfile(p => ({ ...p, headline: v }))}
                    placeholder="Lead Software Engineer"
                  />
                </Field>
                <Field label="Summary">
                  <Textarea
                    value={profile.summary}
                    onChange={v => setProfile(p => ({ ...p, summary: v }))}
                    rows={6}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email">
                    <Input value={profile.email ?? ''} onChange={v => setProfile(p => ({ ...p, email: v }))} />
                  </Field>
                  <Field label="Phone">
                    <Input value={profile.phone ?? ''} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
                  </Field>
                </div>
                <Field label="Location">
                  <Input value={profile.location ?? ''} onChange={v => setProfile(p => ({ ...p, location: v }))} />
                </Field>

                <Field label="Main stack" hint="what a reader takes away in five seconds">
                  <ChipInput
                    values={profile.stack}
                    onChange={v => setProfile(p => ({ ...p, stack: v }))}
                    placeholder="Add a technology"
                  />
                </Field>

                <section>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-text-muted">Links</span>
                    <button
                      onClick={() =>
                        setProfile(p => ({ ...p, links: [...p.links, { label: '', url: '' }] }))
                      }
                      className="text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {profile.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-28 shrink-0">
                          <Input
                            value={link.label}
                            onChange={v =>
                              setProfile(p => {
                                const links = [...p.links];
                                links[i] = { ...links[i], label: v };
                                return { ...p, links };
                              })
                            }
                            placeholder="GitHub"
                          />
                        </div>
                        <Input
                          value={link.url}
                          onChange={v =>
                            setProfile(p => {
                              const links = [...p.links];
                              links[i] = { ...links[i], url: v };
                              return { ...p, links };
                            })
                          }
                          placeholder="https://"
                        />
                        <button
                          onClick={() =>
                            setProfile(p => ({ ...p, links: p.links.filter((_, n) => n !== i) }))
                          }
                          className="shrink-0 text-xs text-text-muted hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <Field label="Notes to self" hint="never shown on the page">
                  <Textarea value={notes} onChange={setNotes} rows={3} />
                </Field>

                <SharePanel
                  share={share}
                  onChange={setShare}
                  copied={copied}
                  onCopied={() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                  dirty={dirty}
                />
              </>
            ) : (
              <>
                {missing.length > 0 && (
                  <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
                    <p className="text-xs text-foreground">
                      {missing.length} project{missing.length > 1 ? 's' : ''} in the KB
                      {missing.length > 1 ? ' are' : ' is'} not in this portfolio:{' '}
                      <span className="text-text-muted">{missing.map(m => m.name).join(', ')}</span>
                    </p>
                    <button
                      onClick={addMissing}
                      className="mt-2 px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
                    >
                      Add them (switched off)
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-text-muted">
                  Drag to reorder. Editing anything here changes this portfolio only.
                </p>

                <div className="space-y-1.5">
                  {ordered.map((item, index) => (
                    <div
                      key={item.projectKey}
                      draggable
                      onDragStart={() => setDragKey(item.projectKey)}
                      onDragEnd={() => setDragKey(null)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        if (dragKey && dragKey !== item.projectKey) move(dragKey, index);
                        setDragKey(null);
                      }}
                      className={`group flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        dragKey === item.projectKey
                          ? 'opacity-40 border-accent'
                          : openKey === item.projectKey
                            ? 'border-accent bg-background'
                            : 'border-border bg-background hover:border-accent/40'
                      } ${item.enabled ? '' : 'opacity-60'}`}
                    >
                      <span
                        className="shrink-0 cursor-grab active:cursor-grabbing text-text-muted/50 hover:text-text-muted"
                        title="Drag to reorder"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="7" cy="5" r="1.4" />
                          <circle cx="13" cy="5" r="1.4" />
                          <circle cx="7" cy="10" r="1.4" />
                          <circle cx="13" cy="10" r="1.4" />
                          <circle cx="7" cy="15" r="1.4" />
                          <circle cx="13" cy="15" r="1.4" />
                        </svg>
                      </span>

                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={e => updateItem({ ...item, enabled: e.target.checked })}
                        title={item.enabled ? 'Shown' : 'Hidden'}
                        className="shrink-0 accent-[#ff6b35]"
                      />

                      <button
                        onClick={() => setOpen({ key: item.projectKey, mode: 'edit' })}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-sm text-foreground truncate">{item.name}</span>
                        <span className="block text-[11px] text-text-muted truncate">
                          {item.oneLiner || 'No one-liner'}
                        </span>
                      </button>

                      <div className="shrink-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => move(item.projectKey, index - 1)}
                          disabled={index === 0}
                          aria-label="Move up"
                          className="px-1 text-text-muted hover:text-foreground disabled:opacity-30 leading-none"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => move(item.projectKey, index + 1)}
                          disabled={index === ordered.length - 1}
                          aria-label="Move down"
                          className="px-1 text-text-muted hover:text-foreground disabled:opacity-30 leading-none"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ preview -- */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl my-6 rounded-xl border border-border overflow-hidden shadow-sm">
              <PortfolioPreview
                profile={profile}
                items={items}
                activeKey={openKey}
                onOpenDetails={key => setOpen({ key, mode: 'visitor' })}
              />
            </div>
          </div>

          {openItem && open?.mode === 'visitor' && (
            <VisitorDetails
              item={openItem}
              onClose={() => setOpen(null)}
              onEdit={() => setOpen({ key: openItem.projectKey, mode: 'edit' })}
            />
          )}

          {openItem && open?.mode === 'edit' && (
            <ProjectDrawer
              item={openItem}
              onChange={updateItem}
              onClose={() => setOpen(null)}
              onReset={() => resetItem(openItem.projectKey)}
              onPreview={() => setOpen({ key: openItem.projectKey, mode: 'visitor' })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
