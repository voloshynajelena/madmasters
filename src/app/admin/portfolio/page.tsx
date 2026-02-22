'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PortfolioProject {
  id: string;
  projectId?: string; // Reference to source project in Projects KB
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
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

type SortField = 'date' | 'name' | 'category' | 'client';
type SortDirection = 'asc' | 'desc';

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
  return project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingField, setTogglingField] = useState<string | null>(null);

  const categories = ['all', 'web', 'e-commerce', 'branding', 'marketing', 'mobile'];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
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
  }, [categoryFilter]);

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'date':
        const dateA = new Date(a.publishedAt || a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || b.updatedAt || 0).getTime();
        comparison = dateA - dateB;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        const catA = getCategories(a)[0] || '';
        const catB = getCategories(b)[0] || '';
        comparison = catA.localeCompare(catB);
        break;
      case 'client':
        comparison = (a.client || '').localeCompare(b.client || '');
        break;
    }

    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  const handleDelete = async (project: PortfolioProject) => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    setDeleting(project.id);
    try {
      // Use different API for KB projects vs legacy
      const url = project.projectId
        ? `/api/admin/projects/${project.projectId}`
        : `/api/admin/portfolio/${project.id}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      alert('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  const toggleField = async (
    project: PortfolioProject,
    field: 'showOnHomepage' | 'hidden' | 'status'
  ) => {
    setToggling(project.id);
    setTogglingField(field);

    let newValue: boolean | string;
    let updateData: Record<string, unknown>;

    if (field === 'status') {
      newValue = project.status === 'published' ? 'draft' : 'published';
      updateData = project.projectId
        ? { portfolio: { published: newValue === 'published' } }
        : { status: newValue };
    } else if (field === 'hidden') {
      newValue = !project.hidden;
      updateData = project.projectId
        ? { portfolio: { hidden: newValue } }
        : { hidden: newValue };
    } else {
      newValue = !project.showOnHomepage;
      updateData = project.projectId
        ? { portfolio: { showOnHomepage: newValue } }
        : { showOnHomepage: newValue };
    }

    try {
      const url = project.projectId
        ? `/api/admin/projects/${project.projectId}`
        : `/api/admin/portfolio/${project.id}`;
      const method = project.projectId ? 'PATCH' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== project.id) return p;
            if (field === 'status') {
              return { ...p, status: newValue as 'draft' | 'published' };
            } else if (field === 'hidden') {
              return { ...p, hidden: newValue as boolean };
            } else {
              return { ...p, showOnHomepage: newValue as boolean };
            }
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
      setTogglingField(null);
    }
  };

  const toggleHomepage = async (project: PortfolioProject) => {
    toggleField(project, 'showOnHomepage');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-text-muted/30 ml-1">↕</span>;
    return <span className="text-accent ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-text-muted text-sm sm:text-base mt-1">
            Manage your portfolio projects.{' '}
            <Link href="/admin/projects" className="text-accent hover:underline">
              Projects KB
            </Link>{' '}
            items with portfolio enabled appear here.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/projects"
            className="inline-flex items-center justify-center px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-border transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            Projects KB
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-xs uppercase tracking-wide w-16 shrink-0">Category</span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-accent text-white'
                    : 'bg-surface text-text-muted hover:bg-surface-hover border border-border'
                }`}
              >
                {cat === 'e-commerce' ? 'E-Com' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-text-muted">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-muted mb-4">No portfolio projects found</p>
          <Link href="/admin/projects" className="text-accent hover:underline">
            Add projects from Projects KB
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {sortedProjects.map((project) => (
              <div key={project.id} className="bg-surface rounded-lg border border-border p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  {project.thumbnail && (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-16 h-12 object-cover rounded shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{project.name}</p>
                    <p className="text-text-muted text-xs">/{getDisplaySlug(project)}</p>
                    <p className="text-text-muted text-sm mt-1">{project.client}</p>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {getCategories(project).map((cat) => (
                    <span key={cat} className="px-2 py-0.5 bg-surface-hover text-text-muted rounded text-xs">
                      {categoryLabels[cat] || cat}
                    </span>
                  ))}
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
                  <button
                    onClick={() => toggleField(project, 'status')}
                    disabled={toggling === project.id}
                    className={`px-2 py-1 rounded ${
                      project.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    } ${toggling === project.id && togglingField === 'status' ? 'opacity-50' : ''}`}
                  >
                    {project.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                  <button
                    onClick={() => toggleField(project, 'hidden')}
                    disabled={toggling === project.id}
                    className={`px-2 py-1 rounded ${
                      !project.hidden
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    } ${toggling === project.id && togglingField === 'hidden' ? 'opacity-50' : ''}`}
                  >
                    {!project.hidden ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => toggleField(project, 'showOnHomepage')}
                    disabled={toggling === project.id}
                    className={`px-2 py-1 rounded ${
                      project.showOnHomepage
                        ? 'bg-accent/20 text-accent'
                        : 'bg-surface-hover text-text-muted'
                    } ${toggling === project.id && togglingField === 'showOnHomepage' ? 'opacity-50' : ''}`}
                  >
                    {project.showOnHomepage ? 'Featured' : 'Not Featured'}
                  </button>
                  <span className="text-text-muted ml-2">{formatDate(project.publishedAt || project.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-sm truncate max-w-[150px]"
                    >
                      {project.liveUrl.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-text-muted text-sm">No live URL</span>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={project.projectId ? `/admin/projects/${project.projectId}?tab=portfolio` : `/admin/portfolio/${project.id}`}
                      className="px-3 py-1.5 text-sm bg-surface-hover text-foreground rounded hover:bg-border transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project)}
                      disabled={deleting === project.id}
                      className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {deleting === project.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-surface rounded-lg overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">
                      <button onClick={() => handleSort('name')} className="flex items-center hover:text-foreground">
                        Project <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">
                      <button onClick={() => handleSort('category')} className="flex items-center hover:text-foreground">
                        Category <SortIcon field="category" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">
                      <button onClick={() => handleSort('client')} className="flex items-center hover:text-foreground">
                        Client <SortIcon field="client" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Visible</th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Featured</th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">
                      <button onClick={() => handleSort('date')} className="flex items-center hover:text-foreground">
                        Published <SortIcon field="date" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Live URL</th>
                    <th className="text-right px-4 py-3 text-text-muted text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-surface-hover transition-colors">
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
                            <p className="text-foreground font-medium">{project.name}</p>
                            <p className="text-text-muted text-sm">/{getDisplaySlug(project)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {getCategories(project).map((cat) => (
                            <span key={cat} className="px-2 py-0.5 bg-surface-hover text-text-muted rounded text-xs">
                              {categoryLabels[cat] || cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{project.client}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleField(project, 'status')}
                          disabled={toggling === project.id}
                          className={`inline-block px-2 py-1 rounded text-xs transition-colors ${
                            project.status === 'published'
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          } ${toggling === project.id && togglingField === 'status' ? 'opacity-50' : ''}`}
                        >
                          {project.status === 'published' ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleField(project, 'hidden')}
                          disabled={toggling === project.id}
                          className={`inline-block px-2 py-1 rounded text-xs transition-colors ${
                            !project.hidden
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          } ${toggling === project.id && togglingField === 'hidden' ? 'opacity-50' : ''}`}
                        >
                          {!project.hidden ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleField(project, 'showOnHomepage')}
                          disabled={toggling === project.id}
                          className={`inline-block px-2 py-1 rounded text-xs transition-colors ${
                            project.showOnHomepage
                              ? 'bg-accent/20 text-accent hover:bg-accent/30'
                              : 'bg-surface-hover text-text-muted hover:bg-border'
                          } ${toggling === project.id && togglingField === 'showOnHomepage' ? 'opacity-50' : ''}`}
                        >
                          {project.showOnHomepage ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">
                        {formatDate(project.publishedAt || project.createdAt)}
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
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={project.projectId ? `/admin/projects/${project.projectId}?tab=portfolio` : `/admin/portfolio/${project.id}`}
                            className="px-3 py-1 text-sm bg-surface-hover text-foreground rounded hover:bg-border transition-colors"
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
          </div>
        </>
      )}
    </div>
  );
}
