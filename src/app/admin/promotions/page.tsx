'use client';

import { useEffect, useState } from 'react';

interface Promotion {
  id: string;
  status: 'draft' | 'published';
  locales: { en: { title: string; description: string; ctaText: string } };
  ctaUrl: string;
  startDate: string | null;
  endDate: string | null;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    status: 'draft' | 'published';
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    startDate: string;
    endDate: string;
  }>({
    status: 'draft',
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();
      if (res.ok) setPromotions(data.promotions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const resetForm = () => {
    setFormData({ status: 'draft', title: '', description: '', ctaText: '', ctaUrl: '', startDate: '', endDate: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        status: formData.status,
        ctaUrl: formData.ctaUrl,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        locales: {
          en: {
            title: formData.title,
            description: formData.description,
            ctaText: formData.ctaText,
          },
        },
      };

      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions</h1>
          <p className="text-white/60 mt-1">Manage offers and promotions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Promotion'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <label className="block text-white/60 text-sm mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'draft' | 'published' }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">CTA Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={e => setFormData(p => ({ ...p, ctaText: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">CTA URL</label>
              <input
                type="url"
                value={formData.ctaUrl}
                onChange={e => setFormData(p => ({ ...p, ctaUrl: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white/60 text-sm mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Promotion'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <p className="text-white/60">No promotions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map(p => (
            <div key={p.id} className="bg-surface rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">{p.locales.en.title}</h3>
                  <p className="text-white/60 text-sm mt-1">{p.locales.en.description}</p>
                  {p.ctaUrl && (
                    <a href={p.ctaUrl} target="_blank" rel="noopener noreferrer" className="text-accent text-sm mt-2 inline-block">
                      {p.locales.en.ctaText || 'View'} →
                    </a>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  p.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
