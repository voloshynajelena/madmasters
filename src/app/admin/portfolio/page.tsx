'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PortfolioProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  category?: string; // Legacy field
  categories?: string[];
  client: string;
  industry: string;
  year: number;
  status: 'draft' | 'published';
  liveUrl?: string;
  thumbnail: string;
  order: number;
  hidden?: boolean;
  showOnHomepage?: boolean;
  updatedAt?: string;
}

// Helper to get categories array (handles legacy single category)
function getCategories(project: PortfolioProject): string[] {
  if (project.categories && project.categories.length > 0) {
    return project.categories;
  }
  if (project.category) {
    return [project.category];
  }
  return [];
}

const categoryLabels: Record<string, string> = {
  web: 'Web',
  'e-commerce': 'E-Commerce',
  branding: 'Branding',
  marketing: 'Marketing',
  mobile: 'Mobile',
};

// Generate slug from name for display
function getDisplaySlug(project: PortfolioProject): string {
  if (project.slug && !project.slug.includes(' ') && project.slug.length < 30) {
    return project.slug;
  }
  // Generate from name
  return project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const categories = ['all', 'web', 'e-commerce', 'branding', 'marketing', 'mobile'];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const res = await fetch(`/api/admin/portfolio?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, categoryFilter]);

  // Apply visibility filter client-side
  const filteredProjects = projects.filter((p) => {
    if (visibilityFilter === 'visible') return !p.hidden;
    if (visibilityFilter === 'hidden') return p.hidden;
    return true;
  });

  const handleDelete = async (project: PortfolioProject) => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    setDeleting(project.id);
    try {
      const res = await fetch(`/api/admin/portfolio/${project.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      alert('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  const toggleStatus = async (project: PortfolioProject) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published';

    try {
      const res = await fetch(`/api/admin/portfolio/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHidden = async (project: PortfolioProject) => {
    const newHidden = !project.hidden;

    try {
      const res = await fetch(`/api/admin/portfolio/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: newHidden }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, hidden: newHidden } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHomepage = async (project: PortfolioProject) => {
    const newShowOnHomepage = !project.showOnHomepage;

    try {
      const res = await fetch(`/api/admin/portfolio/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHomepage: newShowOnHomepage }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, showOnHomepage: newShowOnHomepage } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-white/60 mt-1">Manage your portfolio projects</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === status
                  ? 'bg-accent text-white'
                  : 'bg-surface text-white/70 hover:bg-surface-hover border border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'visible', 'hidden'] as const).map((visibility) => (
            <button
              key={visibility}
              onClick={() => setVisibilityFilter(visibility)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                visibilityFilter === visibility
                  ? 'bg-blue-600 text-white'
                  : 'bg-surface text-white/70 hover:bg-surface-hover border border-white/10'
              }`}
            >
              {visibility}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-white/20 text-white'
                  : 'bg-surface text-white/50 hover:bg-surface-hover border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-white/10">
          <p className="text-white/60 mb-4">No portfolio projects found</p>
          <Link href="/admin/portfolio/new" className="text-accent hover:underline">
            Create your first project
          </Link>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-white/10">
          <p className="text-white/60">No projects match the current filters</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium w-12">#</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Project</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Category</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Client</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Visible</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Homepage</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Live URL</th>
                <th className="text-right px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-white/40 text-sm">{project.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {project.thumbnail && (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-12 h-9 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">{project.name}</p>
                        <p className="text-white/40 text-sm">/{getDisplaySlug(project)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {getCategories(project).map((cat) => (
                        <span key={cat} className="px-2 py-0.5 bg-white/10 text-white/70 rounded text-xs">
                          {categoryLabels[cat] || cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{project.client}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(project)}
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        project.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {project.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleHidden(project)}
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        project.hidden
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {project.hidden ? 'Hidden' : 'Visible'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleHomepage(project)}
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        project.showOnHomepage
                          ? 'bg-accent/20 text-accent'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {project.showOnHomepage ? 'Featured' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm truncate block max-w-[150px]"
                      >
                        {project.liveUrl.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-white/30 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/portfolio/${project.id}`}
                        className="px-3 py-1 text-sm bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project)}
                        disabled={deleting === project.id}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {deleting === project.id ? '...' : 'Delete'}
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
