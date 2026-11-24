'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * The catalogue of tailored portfolios.
 *
 * One per application, kept rather than overwritten, so that what was sent
 * last month can still be read back when somebody calls about it.
 */

interface VersionRow {
  id: string;
  name: string;
  targetRole: string | null;
  targetCompany: string | null;
  notes: string | null;
  status: 'draft' | 'ready';
  projectCount: number;
  totalCount: number;
  cvFileName: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export default function PortfoliosPage() {
  const router = useRouter();
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [copyOf, setCopyOf] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<VersionRow | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/portfolios');
      if (!res.ok) throw new Error('Failed to load portfolios');
      setVersions((await res.json()).versions);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    try {
      setCreating(true);
      const res = await fetch('/api/admin/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          targetRole: targetRole.trim() || undefined,
          targetCompany: targetCompany.trim() || undefined,
          copyOf: copyOf || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to create');
      const { id } = await res.json();
      router.push(`/admin/portfolios/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/portfolios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setVersions(v => v.filter(x => x.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolios</h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            A tailored copy of your work for one application. Editing a portfolio never
            touches the Projects KB — each one is its own snapshot.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          New portfolio
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-sm text-text-muted">Loading…</div>
      ) : versions.length === 0 ? (
        <div className="mt-8 p-8 rounded-xl border border-border text-center">
          <p className="text-sm text-text-muted">
            No portfolios yet. A new one starts as a copy of everything in the Projects KB,
            which you then cut down for the role.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Create the first one
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {versions.map(v => (
            <div
              key={v.id}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-accent/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/portfolios/${v.id}`}
                    className="font-medium text-foreground hover:text-accent transition-colors truncate"
                  >
                    {v.name}
                  </Link>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-medium ${
                      v.status === 'ready'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-text-muted truncate">
                  {[v.targetRole, v.targetCompany].filter(Boolean).join(' · ') || 'No target set'}
                  {' — '}
                  {v.projectCount} of {v.totalCount} projects shown
                  {v.cvFileName ? ` · CV: ${v.cvFileName}` : ''}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setName(`${v.name} (copy)`);
                    setTargetRole(v.targetRole ?? '');
                    setTargetCompany(v.targetCompany ?? '');
                    setCopyOf(v.id);
                    setShowCreate(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => setConfirmDelete(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !creating && setShowCreate(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">
              {copyOf ? 'Duplicate portfolio' : 'New portfolio'}
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              {copyOf
                ? 'Starts as an exact copy of the one you picked.'
                : 'Starts with every project from the Projects KB, as it is today.'}
            </p>

            <div className="mt-4 space-y-3">
              <Field label="Name" hint="What this version is for">
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Senior Frontend — Shopify"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground focus:border-accent outline-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role">
                  <input
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="Senior Frontend"
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground focus:border-accent outline-none"
                  />
                </Field>
                <Field label="Company">
                  <input
                    value={targetCompany}
                    onChange={e => setTargetCompany(e.target.value)}
                    placeholder="Shopify"
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground focus:border-accent outline-none"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setCopyOf('');
                }}
                disabled={creating}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={creating || !name.trim()}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">Delete this portfolio?</h2>
            <p className="mt-2 text-sm text-text-muted">
              <span className="text-foreground font-medium">{confirmDelete.name}</span> will be
              removed permanently. This cannot be undone. Your projects are not affected — a
              portfolio is only a copy.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-foreground transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={() => remove(confirmDelete.id)}
                disabled={deleting === confirmDelete.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting === confirmDelete.id ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
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
