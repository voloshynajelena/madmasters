'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  status: 'draft' | 'published';
  order: number;
  locales: { en: { quote: string }; fr?: { quote: string } };
  author: string;
  role: string;
  company: string;
  updatedAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    status: 'draft' | 'published';
    order: number;
    author: string;
    role: string;
    company: string;
    quoteEn: string;
    quoteFr: string;
  }>({
    status: 'draft',
    order: 0,
    author: '',
    role: '',
    company: '',
    quoteEn: '',
    quoteFr: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (res.ok) setTestimonials(data.testimonials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({
      status: 'draft',
      order: 0,
      author: '',
      role: '',
      company: '',
      quoteEn: '',
      quoteFr: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        status: formData.status,
        order: formData.order,
        author: formData.author,
        role: formData.role,
        company: formData.company,
        locales: {
          en: { quote: formData.quoteEn },
          ...(formData.quoteFr && { fr: { quote: formData.quoteFr } }),
        },
      };

      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchTestimonials();
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
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="text-white/60 mt-1">Manage client testimonials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Testimonial'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
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
          </div>
          <div className="mb-4">
            <label className="block text-white/60 text-sm mb-1">Quote (EN) *</label>
            <textarea
              value={formData.quoteEn}
              onChange={e => setFormData(p => ({ ...p, quoteEn: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white/60 text-sm mb-1">Quote (FR)</label>
            <textarea
              value={formData.quoteFr}
              onChange={e => setFormData(p => ({ ...p, quoteFr: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Testimonial'}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <p className="text-white/60">No testimonials yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map(t => (
            <div key={t.id} className="bg-surface rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white/80 italic mb-3">"{t.locales.en.quote}"</p>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{t.author}</span>
                    {t.role && <span className="text-white/50">{t.role}</span>}
                    {t.company && <span className="text-white/50">@ {t.company}</span>}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  t.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
