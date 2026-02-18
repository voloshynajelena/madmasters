'use client';

import { useEffect, useState } from 'react';

interface Release {
  id: string;
  status: 'draft' | 'published';
  type: 'announcement' | 'update' | 'launch';
  locales: { en: { title: string; body: string } };
  date: string;
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    status: 'draft' | 'published';
    type: 'announcement' | 'update' | 'launch';
    title: string;
    body: string;
    date: string;
  }>({
    status: 'draft',
    type: 'announcement',
    title: '',
    body: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/admin/releases');
      const data = await res.json();
      if (res.ok) setReleases(data.releases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const resetForm = () => {
    setFormData({ status: 'draft', type: 'announcement', title: '', body: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        status: formData.status,
        type: formData.type,
        date: formData.date,
        locales: {
          en: {
            title: formData.title,
            body: formData.body,
          },
        },
      };

      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchReleases();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const typeColors = {
    announcement: 'bg-blue-500/20 text-blue-400',
    update: 'bg-purple-500/20 text-purple-400',
    launch: 'bg-green-500/20 text-green-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Releases</h1>
          <p className="text-white/60 mt-1">Announcements, updates, and launches</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Release'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(p => ({ ...p, type: e.target.value as 'announcement' | 'update' | 'launch' }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              >
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
                <option value="launch">Launch</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white/60 text-sm mb-1">Body</label>
            <textarea
              value={formData.body}
              onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-32"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={formData.status}
              onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'draft' | 'published' }))}
              className="bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Release'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : releases.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <p className="text-white/60">No releases yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map(r => (
            <div key={r.id} className="bg-surface rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${typeColors[r.type]}`}>
                      {r.type}
                    </span>
                    <span className="text-white/40 text-sm">
                      {r.date ? new Date(r.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <h3 className="text-white font-medium">{r.locales.en.title}</h3>
                  {r.locales.en.body && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{r.locales.en.body}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  r.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
