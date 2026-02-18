'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MediaRef {
  url: string;
  path: string;
  alt: string;
}

interface CaseStudyFormData {
  slug: string;
  status: 'draft' | 'published';
  order: number;
  locales: {
    en: {
      title: string;
      summary: string;
      challenge: string;
      solution: string;
      results: string;
    };
    fr?: {
      title: string;
      summary: string;
      challenge: string;
      solution: string;
      results: string;
    };
  };
  client: string;
  industry: string;
  services: ('web' | 'marketing' | 'custom')[];
  technologies: string[];
  date: string;
  liveUrl: string;
  thumbnail: MediaRef;
  heroImage: MediaRef;
  gallery: MediaRef[];
  metrics: Array<{ key: string; value: string }>;
  seo: {
    en: { title: string; description: string };
    fr?: { title: string; description: string };
  };
}

const defaultFormData: CaseStudyFormData = {
  slug: '',
  status: 'draft',
  order: 0,
  locales: {
    en: { title: '', summary: '', challenge: '', solution: '', results: '' },
  },
  client: '',
  industry: '',
  services: [],
  technologies: [],
  date: new Date().toISOString().split('T')[0],
  liveUrl: '',
  thumbnail: { url: '', path: '', alt: '' },
  heroImage: { url: '', path: '', alt: '' },
  gallery: [],
  metrics: [],
  seo: {
    en: { title: '', description: '' },
  },
};

interface Props {
  initialData?: Partial<CaseStudyFormData> & { id?: string };
  mode: 'create' | 'edit';
}

export function CaseStudyForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<CaseStudyFormData>({
    ...defaultFormData,
    ...initialData,
    locales: {
      ...defaultFormData.locales,
      ...initialData?.locales,
    },
    seo: {
      ...defaultFormData.seo,
      ...initialData?.seo,
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'en' | 'fr'>('en');
  const [techInput, setTechInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = mode === 'create'
        ? '/api/admin/case-studies'
        : `/api/admin/case-studies/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/admin/case-studies');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateLocale = (locale: 'en' | 'fr', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      locales: {
        ...prev.locales,
        [locale]: {
          ...prev.locales[locale],
          [field]: value,
        },
      },
    }));
  };

  const toggleService = (service: 'web' | 'marketing' | 'custom') => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  const addMetric = () => {
    setFormData(prev => ({
      ...prev,
      metrics: [...prev.metrics, { key: '', value: '' }],
    }));
  };

  const updateMetric = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const removeMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-surface rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="my-case-study"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Client *</label>
            <input
              type="text"
              value={formData.client}
              onChange={e => setFormData(prev => ({ ...prev, client: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="Client name"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="e.g., E-commerce, Healthcare"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Live URL</label>
            <input
              type="url"
              value={formData.liveUrl}
              onChange={e => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Services */}
        <div className="mt-4">
          <label className="block text-white/60 text-sm mb-2">Services</label>
          <div className="flex gap-2">
            {(['web', 'marketing', 'custom'] as const).map(service => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  formData.services.includes(service)
                    ? 'bg-accent text-white'
                    : 'bg-surface-muted text-white/60 hover:bg-surface-hover'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div className="mt-4">
          <label className="block text-white/60 text-sm mb-2">Technologies</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="Add technology"
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technologies.map(tech => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Localized Content */}
      <div className="bg-surface rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Content</h2>
          <div className="flex gap-2">
            {(['en', 'fr'] as const).map(locale => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveTab(locale)}
                className={`px-4 py-2 rounded-lg text-sm uppercase transition-colors ${
                  activeTab === locale
                    ? 'bg-accent text-white'
                    : 'bg-surface-muted text-white/60 hover:bg-surface-hover'
                }`}
              >
                {locale}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Title *</label>
            <input
              type="text"
              value={formData.locales[activeTab]?.title || ''}
              onChange={e => updateLocale(activeTab, 'title', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              required={activeTab === 'en'}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Summary *</label>
            <textarea
              value={formData.locales[activeTab]?.summary || ''}
              onChange={e => updateLocale(activeTab, 'summary', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
              required={activeTab === 'en'}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Challenge</label>
            <textarea
              value={formData.locales[activeTab]?.challenge || ''}
              onChange={e => updateLocale(activeTab, 'challenge', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Solution</label>
            <textarea
              value={formData.locales[activeTab]?.solution || ''}
              onChange={e => updateLocale(activeTab, 'solution', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Results</label>
            <textarea
              value={formData.locales[activeTab]?.results || ''}
              onChange={e => updateLocale(activeTab, 'results', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-24"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-surface rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Thumbnail URL *</label>
            <input
              type="url"
              value={formData.thumbnail.url}
              onChange={e => setFormData(prev => ({
                ...prev,
                thumbnail: { ...prev.thumbnail, url: e.target.value, path: e.target.value }
              }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Thumbnail Alt</label>
            <input
              type="text"
              value={formData.thumbnail.alt}
              onChange={e => setFormData(prev => ({
                ...prev,
                thumbnail: { ...prev.thumbnail, alt: e.target.value }
              }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Hero Image URL *</label>
            <input
              type="url"
              value={formData.heroImage.url}
              onChange={e => setFormData(prev => ({
                ...prev,
                heroImage: { ...prev.heroImage, url: e.target.value, path: e.target.value }
              }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Hero Image Alt</label>
            <input
              type="text"
              value={formData.heroImage.alt}
              onChange={e => setFormData(prev => ({
                ...prev,
                heroImage: { ...prev.heroImage, alt: e.target.value }
              }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <p className="text-white/40 text-sm mt-2">
          TODO: Image upload will be added. For now, use direct URLs.
        </p>
      </div>

      {/* Metrics */}
      <div className="bg-surface rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Metrics</h2>
          <button
            type="button"
            onClick={addMetric}
            className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20"
          >
            + Add Metric
          </button>
        </div>
        <div className="space-y-2">
          {formData.metrics.map((metric, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={metric.key}
                onChange={e => updateMetric(index, 'key', e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="Metric name (e.g., Conversion Rate)"
              />
              <input
                type="text"
                value={metric.value}
                onChange={e => updateMetric(index, 'value', e.target.value)}
                className="w-32 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() => removeMetric(index)}
                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
              >
                ×
              </button>
            </div>
          ))}
          {formData.metrics.length === 0 && (
            <p className="text-white/40 text-sm">No metrics added yet</p>
          )}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-surface rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">SEO ({activeTab.toUpperCase()})</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Meta Title</label>
            <input
              type="text"
              value={formData.seo[activeTab]?.title || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  [activeTab]: { ...prev.seo[activeTab], title: e.target.value }
                }
              }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Meta Description</label>
            <textarea
              value={formData.seo[activeTab]?.description || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  [activeTab]: { ...prev.seo[activeTab], description: e.target.value }
                }
              }))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none h-20"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create Case Study' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
