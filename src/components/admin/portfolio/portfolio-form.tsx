'use client';

import { useState } from 'react';
import Link from 'next/link';

type CategoryType = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

export interface PortfolioFormData {
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  categories: CategoryType[];
  tags: string[];
  thumbnail: string;
  images: string[];
  client: string;
  industry: string;
  year: number;
  services: string[];
  technologies: string[];
  liveUrl: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  } | null;
  order: number;
  status: 'draft' | 'published';
  hidden?: boolean;
  showOnHomepage?: boolean;
}

const categoryOptions: { value: CategoryType; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'e-commerce', label: 'E-Commerce' },
  { value: 'branding', label: 'Branding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'mobile', label: 'Mobile' },
];

export const defaultPortfolioData: PortfolioFormData = {
  slug: '',
  name: '',
  description: '',
  fullDescription: '',
  categories: [],
  tags: [],
  thumbnail: '',
  images: [],
  client: '',
  industry: '',
  year: new Date().getFullYear(),
  services: [],
  technologies: [],
  liveUrl: '',
  challenge: '',
  solution: '',
  results: [],
  testimonial: null,
  order: 0,
  status: 'draft',
  showOnHomepage: false,
};

interface PortfolioFormProps {
  initialData?: Partial<PortfolioFormData>;
  onSubmit: (data: PortfolioFormData) => Promise<void>;
  onCancel?: () => void;
  cancelHref?: string;
  submitLabel?: string;
  saving?: boolean;
  error?: string | null;
}

export function PortfolioForm({
  initialData,
  onSubmit,
  onCancel,
  cancelHref,
  submitLabel = 'Save',
  saving = false,
  error,
}: PortfolioFormProps) {
  const [data, setData] = useState<PortfolioFormData>({
    ...defaultPortfolioData,
    ...initialData,
  });

  // Temporary input states for array fields
  const [tagInput, setTagInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(data);
  };

  const updateField = <K extends keyof PortfolioFormData>(field: K, value: PortfolioFormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'tags' | 'services' | 'technologies' | 'results' | 'images', value: string) => {
    if (!value.trim()) return;
    setData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  const removeFromArray = (field: 'tags' | 'services' | 'technologies' | 'results' | 'images', index: number) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const generateSlug = () => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    updateField('slug', slug);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Actions at top */}
      <div className="flex justify-between items-center gap-4 sticky top-0 bg-background py-4 z-10 -mx-4 px-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">Status:</span>
          <select
            value={data.status}
            onChange={(e) => updateField('status', e.target.value as 'draft' | 'published')}
            className={`px-3 py-1.5 rounded-lg text-sm border-0 ${
              data.status === 'published'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!data.hidden}
              onChange={(e) => updateField('hidden', !e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-surface-muted text-accent focus:ring-accent"
            />
            <span className="text-white/60 text-sm">Visible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showOnHomepage || false}
              onChange={(e) => updateField('showOnHomepage', e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-surface-muted text-accent focus:ring-accent"
            />
            <span className="text-white/60 text-sm">Featured</span>
          </label>
        </div>
        <div className="flex gap-3">
          {cancelHref ? (
            <Link
              href={cancelHref}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </Link>
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-surface rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Name *</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => !data.slug && generateSlug()}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Slug *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-3 py-2 bg-white/10 text-white/60 rounded-lg hover:bg-white/20"
              >
                Generate
              </button>
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Client *</label>
            <input
              type="text"
              value={data.client}
              onChange={(e) => updateField('client', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Industry</label>
            <input
              type="text"
              value={data.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-2">Categories *</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => {
                const isSelected = data.categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      const newCategories = isSelected
                        ? data.categories.filter((c) => c !== cat.value)
                        : [...data.categories, cat.value];
                      updateField('categories', newCategories);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-accent text-white'
                        : 'bg-surface-muted border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Year</label>
            <input
              type="number"
              value={data.year}
              onChange={(e) => updateField('year', parseInt(e.target.value))}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              min={2000}
              max={2100}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Live URL</label>
            <input
              type="url"
              value={data.liveUrl}
              onChange={(e) => updateField('liveUrl', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-surface rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Short Description</label>
            <input
              type="text"
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="Brief overview (shown in cards)"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Full Description</label>
            <textarea
              value={data.fullDescription}
              onChange={(e) => updateField('fullDescription', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[100px] resize-y"
              placeholder="Detailed project overview"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-surface rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Images</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Thumbnail URL</label>
            <input
              type="text"
              value={data.thumbnail}
              onChange={(e) => updateField('thumbnail', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="/content/img/portfolio/project.png"
            />
            {data.thumbnail && (
              <img src={data.thumbnail} alt="Thumbnail" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Gallery Images</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="/content/img/portfolio/image.png"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('images', imageInput);
                    setImageInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addToArray('images', imageInput);
                  setImageInput('');
                }}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt={`Gallery ${i + 1}`} className="h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeFromArray('images', i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Details */}
      <section className="bg-surface rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Case Study Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Challenge</label>
            <textarea
              value={data.challenge}
              onChange={(e) => updateField('challenge', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[80px] resize-y"
              placeholder="What problem did the client face?"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Solution</label>
            <textarea
              value={data.solution}
              onChange={(e) => updateField('solution', e.target.value)}
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[80px] resize-y"
              placeholder="How did you solve it?"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Results</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="e.g., 150% increase in conversions"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('results', resultInput);
                    setResultInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addToArray('results', resultInput);
                  setResultInput('');
                }}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.results.map((result, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-2"
                >
                  ✓ {result}
                  <button
                    type="button"
                    onClick={() => removeFromArray('results', i)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tags & Technologies */}
      <section className="bg-surface rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Tags & Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('tags', tagInput);
                    setTagInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addToArray('tags', tagInput);
                  setTagInput('');
                }}
                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => removeFromArray('tags', i)} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Services</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="Add service"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('services', serviceInput);
                    setServiceInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addToArray('services', serviceInput);
                  setServiceInput('');
                }}
                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.services.map((service, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1"
                >
                  {service}
                  <button type="button" onClick={() => removeFromArray('services', i)} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Technologies</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="Add tech"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('technologies', techInput);
                    setTechInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addToArray('technologies', techInput);
                  setTechInput('');
                }}
                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-accent/20 text-accent rounded text-xs flex items-center gap-1"
                >
                  {tech}
                  <button type="button" onClick={() => removeFromArray('technologies', i)} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-surface rounded-lg p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Testimonial (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Quote</label>
            <textarea
              value={data.testimonial?.quote || ''}
              onChange={(e) =>
                updateField('testimonial', {
                  quote: e.target.value,
                  author: data.testimonial?.author || '',
                  role: data.testimonial?.role || '',
                })
              }
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[80px] resize-y"
              placeholder="What did the client say about the project?"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Author Name</label>
            <input
              type="text"
              value={data.testimonial?.author || ''}
              onChange={(e) =>
                updateField('testimonial', {
                  quote: data.testimonial?.quote || '',
                  author: e.target.value,
                  role: data.testimonial?.role || '',
                })
              }
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Author Role</label>
            <input
              type="text"
              value={data.testimonial?.role || ''}
              onChange={(e) =>
                updateField('testimonial', {
                  quote: data.testimonial?.quote || '',
                  author: data.testimonial?.author || '',
                  role: e.target.value,
                })
              }
              className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="CEO, Company Name"
            />
          </div>
        </div>
      </section>

    </form>
  );
}
