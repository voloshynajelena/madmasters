'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type CategoryType = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

interface PortfolioProject {
  id?: string;
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
}

const categoryOptions: { value: CategoryType; label: string }[] = [
  { value: 'web', label: 'Web Development' },
  { value: 'e-commerce', label: 'E-Commerce' },
  { value: 'branding', label: 'Branding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'mobile', label: 'Mobile Apps' },
];

const defaultProject: PortfolioProject = {
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
};

export default function PortfolioEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [project, setProject] = useState<PortfolioProject>(defaultProject);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Temporary input states for array fields
  const [tagInput, setTagInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetchProject();
    }
  }, [isNew, params.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/admin/portfolio/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Handle migration from old 'category' to new 'categories' array
      let categories = data.categories || [];
      if (categories.length === 0 && data.category) {
        categories = [data.category];
      }

      setProject({
        ...defaultProject,
        ...data,
        categories,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isNew ? '/api/admin/portfolio' : `/api/admin/portfolio/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/admin/portfolio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof PortfolioProject>(field: K, value: PortfolioProject[K]) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'tags' | 'services' | 'technologies' | 'results' | 'images', value: string) => {
    if (!value.trim()) return;
    setProject((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  const removeFromArray = (field: 'tags' | 'services' | 'technologies' | 'results' | 'images', index: number) => {
    setProject((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const generateSlug = () => {
    const slug = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    updateField('slug', slug);
  };

  if (loading) {
    return <div className="text-white/60">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? 'New Project' : `Edit: ${project.name}`}
          </h1>
          <p className="text-white/60 mt-1">
            {isNew ? 'Add a new portfolio project' : 'Update project details'}
          </p>
        </div>
        <Link
          href="/admin/portfolio"
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          ← Back to Portfolio
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-surface rounded-lg p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Name *</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => updateField('name', e.target.value)}
                onBlur={() => !project.slug && generateSlug()}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={project.slug}
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
                value={project.client}
                onChange={(e) => updateField('client', e.target.value)}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Industry</label>
              <input
                type="text"
                value={project.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">Categories *</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => {
                  const isSelected = project.categories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        const newCategories = isSelected
                          ? project.categories.filter((c) => c !== cat.value)
                          : [...project.categories, cat.value];
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
                value={project.year}
                onChange={(e) => updateField('year', parseInt(e.target.value))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                min={2000}
                max={2100}
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Status</label>
              <select
                value={project.status}
                onChange={(e) => updateField('status', e.target.value as 'draft' | 'published')}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Live URL</label>
              <input
                type="url"
                value={project.liveUrl}
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
                value={project.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="Brief overview (shown in cards)"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Full Description</label>
              <textarea
                value={project.fullDescription}
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
                value={project.thumbnail}
                onChange={(e) => updateField('thumbnail', e.target.value)}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="/content/img/portfolio/project.png"
              />
              {project.thumbnail && (
                <img src={project.thumbnail} alt="Thumbnail" className="mt-2 h-32 object-cover rounded" />
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
                {project.images.map((img, i) => (
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
                value={project.challenge}
                onChange={(e) => updateField('challenge', e.target.value)}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[80px] resize-y"
                placeholder="What problem did the client face?"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Solution</label>
              <textarea
                value={project.solution}
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
                {project.results.map((result, i) => (
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
                {project.tags.map((tag, i) => (
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
                {project.services.map((service, i) => (
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
                {project.technologies.map((tech, i) => (
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
                value={project.testimonial?.quote || ''}
                onChange={(e) =>
                  updateField('testimonial', {
                    quote: e.target.value,
                    author: project.testimonial?.author || '',
                    role: project.testimonial?.role || '',
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
                value={project.testimonial?.author || ''}
                onChange={(e) =>
                  updateField('testimonial', {
                    quote: project.testimonial?.quote || '',
                    author: e.target.value,
                    role: project.testimonial?.role || '',
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
                value={project.testimonial?.role || ''}
                onChange={(e) =>
                  updateField('testimonial', {
                    quote: project.testimonial?.quote || '',
                    author: project.testimonial?.author || '',
                    role: e.target.value,
                  })
                }
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="CEO, Company Name"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/portfolio"
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
