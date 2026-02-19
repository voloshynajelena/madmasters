'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CaseStudy {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  order: number;
  client: string;
  industry: string;
  locales: {
    en: { title: string; summary: string };
    fr?: { title: string; summary: string };
  };
  updatedAt: string;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? '/api/admin/case-studies'
        : `/api/admin/case-studies?status=${filter}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setCaseStudies(data.caseStudies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, [filter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCaseStudies(prev => prev.filter(cs => cs.id !== id));
    } catch (err) {
      alert('Failed to delete case study');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Case Studies</h1>
          <p className="text-white/60 mt-1">Manage your portfolio projects</p>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          + New Case Study
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'published', 'draft'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              filter === status
                ? 'bg-accent text-white'
                : 'bg-surface text-white/70 hover:bg-surface-hover'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : caseStudies.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-white/10">
          <p className="text-white/60 mb-4">No case studies found</p>
          <Link
            href="/admin/case-studies/new"
            className="text-accent hover:underline"
          >
            Create your first case study
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-lg overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Title</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Client</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Updated</th>
                <th className="text-right px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {caseStudies.map((cs) => (
                <tr key={cs.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{cs.locales.en.title}</p>
                      <p className="text-white/40 text-sm">/{cs.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{cs.client}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      cs.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {cs.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">
                    {cs.updatedAt ? new Date(cs.updatedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/case-studies/${cs.id}`}
                        className="px-3 py-1 text-sm bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(cs.id, cs.locales.en.title)}
                        disabled={deleting === cs.id}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {deleting === cs.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
