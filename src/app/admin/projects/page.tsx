'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  key: string;
  name: string;
  client?: string;
  status: 'active' | 'maintenance' | 'paused' | 'archived' | 'completed';
  type?: 'internal' | 'client';
  oneLiner: string;
  tags: string[];
  owner?: string;
  stack: {
    frontend: { name: string };
    backend: { name: string };
    database: { name: string };
  };
  updatedAt: string;
  portfolio?: {
    published: boolean;
    showOnHomepage?: boolean;
    isLegacy?: boolean; // True if info comes from legacy portfolio collection (needs sync)
  };
}

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ key: string; error: string }>;
  projects: Array<{ key: string; id: string; action: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-600 dark:text-green-400',
  maintenance: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  paused: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  archived: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
  completed: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'skip' | 'update' | 'overwrite'>('skip');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [pasteJson, setPasteJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const url = `/api/admin/projects${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
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
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async (type: 'all' | 'filtered' | 'single', projectId?: string, format: 'xlsx' | 'json' = 'xlsx') => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (type === 'single' && projectId) {
        params.append('id', projectId);
      } else if (type === 'filtered' && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('format', format);

      const url = `/api/admin/projects/export?${params}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `projects.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err) {
      alert('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const handleSyncPortfolio = async (projectId: string) => {
    setSyncing(projectId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/sync-portfolio`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sync failed');
      }
      // Refresh projects list
      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sync portfolio');
    } finally {
      setSyncing(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (importTab === 'file') {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;

      setImporting(true);
      setImportError(null);
      setImportResult(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', importMode);

        const res = await fetch('/api/admin/projects/import', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Import failed');
        }

        setImportResult(data);
        fetchProjects();
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed');
      } finally {
        setImporting(false);
      }
    } else {
      // Paste JSON mode
      if (!pasteJson.trim()) return;

      setImporting(true);
      setImportError(null);
      setImportResult(null);

      try {
        // Validate JSON first
        let jsonData;
        try {
          jsonData = JSON.parse(pasteJson);
        } catch {
          throw new Error('Invalid JSON format. Please check your input.');
        }

        // Create a JSON file blob and upload it
        const blob = new Blob([pasteJson], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, 'import.json');
        formData.append('mode', importMode);

        const res = await fetch('/api/admin/projects/import', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Import failed');
        }

        setImportResult(data);
        fetchProjects();
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed');
      } finally {
        setImporting(false);
      }
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportResult(null);
    setImportError(null);
    setImportTab('file');
    setPasteJson('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects Knowledge Base</h1>
          <p className="text-text-muted mt-1">Central hub for all project information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Import
          </button>
          <button
            onClick={() => handleExport(statusFilter !== 'all' ? 'filtered' : 'all', undefined, 'json')}
            disabled={exporting}
            className="px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-border transition-colors disabled:opacity-50"
          >
            {exporting ? '...' : 'Export JSON'}
          </button>
          <button
            onClick={() => handleExport(statusFilter !== 'all' ? 'filtered' : 'all', undefined, 'xlsx')}
            disabled={exporting}
            className="px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-border transition-colors disabled:opacity-50"
          >
            {exporting ? '...' : 'Export Excel'}
          </button>
          <Link
            href="/admin/projects/new"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'maintenance', 'paused', 'archived', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-hover'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-text-muted text-sm">Tags:</span>
          {allTags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-accent/10 text-accent rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-text-muted">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <p className="text-text-muted mb-4">No projects found</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin/projects/new"
              className="text-accent hover:underline"
            >
              Add your first project
            </Link>
            <span className="text-text-muted">or</span>
            <button
              onClick={() => setShowImportModal(true)}
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Import from file
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-lg overflow-hidden border border-border">
          <table className="w-full">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Project</th>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Client</th>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Stack</th>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Portfolio</th>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Owner</th>
                <th className="text-left px-4 py-3 text-text-muted text-sm font-medium">Updated</th>
                <th className="text-right px-4 py-3 text-text-muted text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <Link href={`/admin/projects/${project.id}`} className="text-foreground font-medium hover:text-accent">
                        {project.name}
                      </Link>
                      <p className="text-text-muted text-sm">{project.oneLiner}</p>
                      {project.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-surface-muted text-text-muted rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="text-text-muted text-xs">+{project.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{project.client || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-text-muted space-y-0.5">
                      <div>FE: {project.stack?.frontend?.name || 'TBD'}</div>
                      <div>BE: {project.stack?.backend?.name || 'TBD'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                        STATUS_COLORS[project.status] || 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                      }`}>
                        {project.status}
                      </span>
                      {project.type === 'internal' && (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                          Internal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {project.portfolio?.published ? (
                      <Link
                        href={`/admin/projects/${project.id}?tab=portfolio`}
                        className="inline-block px-2 py-1 rounded text-xs bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Edit Portfolio
                      </Link>
                    ) : project.portfolio?.isLegacy ? (
                      <button
                        onClick={() => handleSyncPortfolio(project.id)}
                        disabled={syncing === project.id}
                        className="inline-block px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                      >
                        {syncing === project.id ? 'Syncing...' : 'Import Legacy'}
                      </button>
                    ) : (
                      <Link
                        href={`/admin/projects/${project.id}?tab=portfolio`}
                        className="inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        Add to Portfolio
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground text-sm">{project.owner || '-'}</td>
                  <td className="px-4 py-3 text-text-muted text-sm">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="px-3 py-1 text-sm bg-surface-hover text-foreground rounded hover:bg-border transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleExport('single', project.id, 'json')}
                        className="px-2 py-1 text-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        title="Export as JSON"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => handleExport('single', project.id, 'xlsx')}
                        className="px-2 py-1 text-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        title="Export as Excel"
                      >
                        XLSX
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        disabled={deleting === project.id}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
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

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['active', 'maintenance', 'paused', 'archived', 'completed'] as const).map(status => (
          <div key={status} className="bg-surface rounded-lg p-4 border border-border">
            <div className="text-2xl font-bold text-foreground">
              {projects.filter(p => p.status === status).length}
            </div>
            <div className="text-text-muted text-sm capitalize">{status}</div>
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full p-6 border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Import Projects</h2>
              <button
                onClick={closeImportModal}
                className="text-text-muted hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {importResult ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  <h3 className={`font-medium ${importResult.success ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    Import Complete
                  </h3>
                  <div className="mt-2 text-sm text-foreground space-y-1">
                    <p>Created: {importResult.created}</p>
                    <p>Updated: {importResult.updated}</p>
                    <p>Skipped: {importResult.skipped}</p>
                    {importResult.errors.length > 0 && (
                      <p className="text-red-600 dark:text-red-400">Errors: {importResult.errors.length}</p>
                    )}
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-500/20 p-4 rounded-lg">
                    <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Errors:</h4>
                    <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>{err.key}: {err.error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.projects.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <h4 className="text-text-muted text-sm mb-2">Imported projects:</h4>
                    <ul className="text-sm text-foreground space-y-1">
                      {importResult.projects.map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            p.action === 'created' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                            p.action === 'updated' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                            'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          }`}>
                            {p.action}
                          </span>
                          {p.key}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={closeImportModal}
                  className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleImport} className="space-y-4">
                {importError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {importError}
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button
                    type="button"
                    onClick={() => setImportTab('file')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      importTab === 'file'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-foreground'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportTab('paste')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      importTab === 'paste'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-foreground'
                    }`}
                  >
                    Paste JSON
                  </button>
                </div>

                {importTab === 'file' ? (
                  <div>
                    <label className="block text-text-muted text-sm mb-2">File (JSON or Excel)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.xlsx,.xls"
                      className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2 text-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-accent file:text-white file:cursor-pointer"
                    />
                    <p className="text-text-muted text-xs mt-1">
                      Accepts .json or .xlsx files. See docs for format.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-text-muted text-sm mb-2">Paste JSON</label>
                    <textarea
                      value={pasteJson}
                      onChange={(e) => setPasteJson(e.target.value)}
                      placeholder='{"projects": [...]}'
                      rows={8}
                      className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2 text-foreground font-mono text-sm focus:border-accent focus:outline-none resize-y"
                    />
                    <p className="text-text-muted text-xs mt-1">
                      Paste your JSON data directly. See example below.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-text-muted text-sm mb-2">If project already exists:</label>
                  <div className="space-y-2">
                    {[
                      { value: 'skip', label: 'Skip', desc: 'Keep existing, skip duplicate' },
                      { value: 'update', label: 'Merge', desc: 'Update with new data, keep existing fields' },
                      { value: 'overwrite', label: 'Overwrite', desc: 'Replace entirely with imported data' },
                    ].map(option => (
                      <label key={option.value} className="flex items-start gap-3 p-3 bg-surface-muted rounded-lg cursor-pointer hover:bg-surface-hover">
                        <input
                          type="radio"
                          name="mode"
                          value={option.value}
                          checked={importMode === option.value}
                          onChange={e => setImportMode(e.target.value as typeof importMode)}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="text-foreground text-sm font-medium">{option.label}</div>
                          <div className="text-text-muted text-xs">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={importing}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Import'}
                  </button>
                  <button
                    type="button"
                    onClick={closeImportModal}
                    className="px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-border"
                  >
                    Cancel
                  </button>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-text-muted text-sm">JSON Format Example:</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const jsonExample = `{
  "projects": [
    {
      "key": "my-project",
      "name": "My Project",
      "client": "Client Name",
      "status": "active",
      "type": "client",
      "oneLiner": "Brief project description",
      "essence": "Detailed description of what the project is about",
      "productUrls": ["https://myproject.com"],
      "owner": "John Doe",
      "techLead": "Jane Smith",
      "team": ["Alice", "Bob"],
      "tags": ["web", "saas", "b2b"],
      "stack": {
        "frontend": { "name": "Next.js", "version": "14.0", "notes": "" },
        "backend": { "name": "Node.js", "version": "20", "notes": "" },
        "database": { "name": "PostgreSQL", "version": "15", "notes": "" },
        "hosting": { "name": "Vercel", "notes": "" },
        "auth": { "name": "Firebase Auth", "notes": "" },
        "cicd": { "name": "GitHub Actions", "notes": "" },
        "analytics": { "name": "Google Analytics", "notes": "" },
        "monitoring": { "name": "Sentry", "notes": "" }
      },
      "environments": [
        { "type": "PROD", "url": "https://myproject.com", "notes": "" },
        { "type": "STAGE", "url": "https://stage.myproject.com", "notes": "" }
      ],
      "links": [
        { "type": "REPO", "label": "GitHub", "url": "https://github.com/org/repo", "notes": "" },
        { "type": "JIRA", "label": "Jira Board", "url": "https://jira.com/board", "notes": "" },
        { "type": "FIGMA", "label": "Design", "url": "https://figma.com/file/xxx", "notes": "" }
      ],
      "instructions": {
        "localSetupMd": "## Local Setup\\n\\n1. Clone repo\\n2. npm install\\n3. npm run dev",
        "deployMd": "## Deployment\\n\\nPush to main branch to deploy to production.",
        "testingMd": "## Testing\\n\\nnpm run test",
        "runbookMd": "## Runbook\\n\\n### Common issues\\n- Check logs in Vercel",
        "knownIssuesMd": "## Known Issues\\n\\nNone currently."
      },
      "operations": {
        "sla": "99.9% uptime",
        "backups": "Daily automated",
        "pii": "low",
        "dataRegion": "US-East",
        "secretsLocation": "1Password vault: MyProject",
        "onCallRotation": "",
        "incidentProcess": ""
      },
      "security": {
        "authMethod": "OAuth 2.0",
        "dataEncryption": "AES-256 at rest, TLS in transit",
        "complianceNotes": "GDPR compliant"
      },
      "documentation": {
        "envVarsTemplate": "DATABASE_URL=\\nAPI_KEY=",
        "databaseSchema": "## Database Schema\\n\\nUser, Product tables...",
        "apiEndpoints": "GET /api/users\\nPOST /api/orders",
        "seedData": "admin@test.com / password123",
        "changelog": "## v1.0.0\\n- Initial release",
        "cicdPipeline": "GitHub Actions on push to main"
      },
      "portfolio": {
        "published": true,
        "slug": "my-project",
        "categories": ["web", "e-commerce"],
        "industry": "Technology",
        "year": 2024,
        "services": ["Web Development", "UI/UX Design"],
        "thumbnail": "https://example.com/thumb.jpg",
        "showOnHomepage": true,
        "challenge": "The client needed...",
        "solution": "We built...",
        "results": ["50% faster", "2x conversions"]
      }
    }
  ]
}`;
                        navigator.clipboard.writeText(jsonExample);
                        alert('JSON example copied to clipboard!');
                      }}
                      className="px-3 py-1 text-xs bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-surface-muted rounded-lg p-3 text-xs text-foreground overflow-x-auto max-h-64 overflow-y-auto">
{`{
  "projects": [
    {
      "key": "my-project",
      "name": "My Project",
      "client": "Client Name",
      "status": "active",
      "type": "client",
      "oneLiner": "Brief project description",
      "essence": "Detailed description of what the project is about",
      "productUrls": ["https://myproject.com"],
      "owner": "John Doe",
      "techLead": "Jane Smith",
      "team": ["Alice", "Bob"],
      "tags": ["web", "saas", "b2b"],
      "stack": {
        "frontend": { "name": "Next.js", "version": "14.0", "notes": "" },
        "backend": { "name": "Node.js", "version": "20", "notes": "" },
        "database": { "name": "PostgreSQL", "version": "15", "notes": "" },
        "hosting": { "name": "Vercel", "notes": "" },
        "auth": { "name": "Firebase Auth", "notes": "" },
        "cicd": { "name": "GitHub Actions", "notes": "" },
        "analytics": { "name": "Google Analytics", "notes": "" },
        "monitoring": { "name": "Sentry", "notes": "" }
      },
      "environments": [
        { "type": "PROD", "url": "https://myproject.com", "notes": "" },
        { "type": "STAGE", "url": "https://stage.myproject.com", "notes": "" }
      ],
      "links": [
        { "type": "REPO", "label": "GitHub", "url": "https://github.com/org/repo", "notes": "" },
        { "type": "JIRA", "label": "Jira Board", "url": "https://jira.com/board", "notes": "" },
        { "type": "FIGMA", "label": "Design", "url": "https://figma.com/file/xxx", "notes": "" }
      ],
      "instructions": {
        "localSetupMd": "## Local Setup\\n\\n1. Clone repo\\n2. npm install\\n3. npm run dev",
        "deployMd": "## Deployment\\n\\nPush to main branch to deploy to production.",
        "testingMd": "## Testing\\n\\nnpm run test",
        "runbookMd": "## Runbook\\n\\n### Common issues\\n- Check logs in Vercel",
        "knownIssuesMd": "## Known Issues\\n\\nNone currently."
      },
      "operations": {
        "sla": "99.9% uptime",
        "backups": "Daily automated",
        "pii": "low",
        "dataRegion": "US-East",
        "secretsLocation": "1Password vault: MyProject",
        "onCallRotation": "",
        "incidentProcess": ""
      },
      "security": {
        "authMethod": "OAuth 2.0",
        "dataEncryption": "AES-256 at rest, TLS in transit",
        "complianceNotes": "GDPR compliant"
      },
      "documentation": {
        "envVarsTemplate": "DATABASE_URL=\\nAPI_KEY=",
        "databaseSchema": "## Database Schema\\n\\nUser, Product tables...",
        "apiEndpoints": "GET /api/users\\nPOST /api/orders",
        "seedData": "admin@test.com / password123",
        "changelog": "## v1.0.0\\n- Initial release",
        "cicdPipeline": "GitHub Actions on push to main"
      },
      "portfolio": {
        "published": true,
        "slug": "my-project",
        "categories": ["web", "e-commerce"],
        "industry": "Technology",
        "year": 2024,
        "services": ["Web Development", "UI/UX Design"],
        "thumbnail": "https://example.com/thumb.jpg",
        "showOnHomepage": true,
        "challenge": "The client needed...",
        "solution": "We built...",
        "results": ["50% faster", "2x conversions"]
      }
    }
  ]
}`}
                  </pre>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
