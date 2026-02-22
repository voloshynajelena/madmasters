'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ProjectStatus = 'active' | 'maintenance' | 'paused' | 'archived' | 'completed';
type ProjectType = 'internal' | 'client';
type EnvironmentType = 'DEV' | 'STAGE' | 'PROD' | 'DEMO' | 'QA';
type LinkType = 'REPO' | 'JIRA' | 'FIGMA' | 'SENTRY' | 'VERCEL' | 'AWS' | 'GCP' | 'FIREBASE' | 'SUPABASE' | 'AUTH' | 'DATABASE' | 'STORAGE' | 'ANALYTICS' | 'MONITORING' | 'DOCS' | 'WEBSITE' | 'SLACK' | 'NOTION' | 'CONFLUENCE' | 'OTHER';
type PIILevel = 'none' | 'low' | 'medium' | 'high' | 'unknown';
type PortfolioCategory = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

interface ProjectFormData {
  key: string;
  name: string;
  client: string;
  status: ProjectStatus;
  type: ProjectType;
  oneLiner: string;
  essence: string;
  productUrls: string[];
  owner: string;
  techLead: string;
  team: string[];
  tags: string[];
  stack: {
    frontend: { name: string; version: string; notes: string };
    backend: { name: string; version: string; notes: string };
    database: { name: string; version: string; notes: string };
    hosting: { name: string; notes: string };
    auth: { name: string; notes: string };
    cicd: { name: string; notes: string };
    analytics: { name: string; notes: string };
    monitoring: { name: string; notes: string };
  };
  environments: Array<{ type: EnvironmentType; url: string; notes: string }>;
  links: Array<{ type: LinkType; label: string; url: string; notes: string }>;
  instructions: {
    localSetupMd: string;
    deployMd: string;
    testingMd: string;
    runbookMd: string;
    knownIssuesMd: string;
  };
  operations: {
    sla: string;
    backups: string;
    pii: PIILevel;
    dataRegion: string;
    secretsLocation: string;
    onCallRotation: string;
    incidentProcess: string;
  };
  security: {
    authMethod: string;
    dataEncryption: string;
    complianceNotes: string;
  };
  documentation: {
    envVarsTemplate: string;
    databaseSchema: string;
    apiEndpoints: string;
    seedData: string;
    changelog: string;
    cicdPipeline: string;
  };
  portfolio: {
    published: boolean;
    slug: string;
    categories: PortfolioCategory[];
    thumbnail: string;
    images: string[];
    industry: string;
    year: number;
    services: string[];
    fullDescription: string;
    challenge: string;
    solution: string;
    results: string[];
    testimonial: {
      quote: string;
      author: string;
      role: string;
    } | null;
    order: number;
    hidden: boolean;
    showOnHomepage: boolean;
  };
}

const defaultFormData: ProjectFormData = {
  key: '',
  name: '',
  client: '',
  status: 'active',
  type: 'client',
  oneLiner: '',
  essence: '',
  productUrls: [],
  owner: '',
  techLead: '',
  team: [],
  tags: [],
  stack: {
    frontend: { name: '', version: '', notes: '' },
    backend: { name: '', version: '', notes: '' },
    database: { name: '', version: '', notes: '' },
    hosting: { name: '', notes: '' },
    auth: { name: '', notes: '' },
    cicd: { name: '', notes: '' },
    analytics: { name: '', notes: '' },
    monitoring: { name: '', notes: '' },
  },
  environments: [],
  links: [],
  instructions: {
    localSetupMd: '## Local Setup\n\n',
    deployMd: '## Deployment\n\n',
    testingMd: '## Testing\n\n',
    runbookMd: '## Runbook\n\n',
    knownIssuesMd: '## Known Issues\n\n',
  },
  operations: {
    sla: '',
    backups: '',
    pii: 'unknown',
    dataRegion: '',
    secretsLocation: '',
    onCallRotation: '',
    incidentProcess: '',
  },
  security: {
    authMethod: '',
    dataEncryption: '',
    complianceNotes: '',
  },
  documentation: {
    envVarsTemplate: '## Environment Variables\n\n```bash\n# apps/api/.env.example\nDATABASE_URL=\nAPI_KEY=\n\n# apps/web/.env.example\nNEXT_PUBLIC_API_URL=\n```',
    databaseSchema: '## Database Schema\n\nDescribe the database structure, relationships, and any ERD links.',
    apiEndpoints: '## API Endpoints\n\n| Method | Endpoint | Description |\n|--------|----------|-------------|\n| GET | /api/users | List users |',
    seedData: '## Test Users & Seed Data\n\nDescribe test accounts and how to seed the database.',
    changelog: '## Changelog\n\n### v1.0.0\n- Initial release',
    cicdPipeline: '## CI/CD Pipeline\n\nDescribe the GitHub Actions or other CI/CD setup.',
  },
  portfolio: {
    published: false,
    slug: '',
    categories: [],
    thumbnail: '',
    images: [],
    industry: '',
    year: new Date().getFullYear(),
    services: [],
    fullDescription: '',
    challenge: '',
    solution: '',
    results: [],
    testimonial: null,
    order: 0,
    hidden: false,
    showOnHomepage: false,
  },
};

const LINK_TYPES: LinkType[] = ['REPO', 'JIRA', 'FIGMA', 'SENTRY', 'VERCEL', 'AWS', 'GCP', 'FIREBASE', 'SUPABASE', 'AUTH', 'DATABASE', 'STORAGE', 'ANALYTICS', 'MONITORING', 'DOCS', 'WEBSITE', 'SLACK', 'NOTION', 'CONFLUENCE', 'OTHER'];
const ENV_TYPES: EnvironmentType[] = ['DEV', 'STAGE', 'PROD', 'DEMO', 'QA'];
const PII_LEVELS: PIILevel[] = ['none', 'low', 'medium', 'high', 'unknown'];
const TABS = ['overview', 'portfolio', 'stack', 'environments', 'links', 'instructions', 'docs', 'operations', 'security'] as const;
const PORTFOLIO_CATEGORIES: PortfolioCategory[] = ['web', 'e-commerce', 'branding', 'marketing', 'mobile'];
type Tab = typeof TABS[number];

interface Props {
  initialData?: Partial<ProjectFormData> & { id?: string };
  mode: 'create' | 'edit';
}

export function ProjectForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    ...defaultFormData,
    ...initialData,
    stack: { ...defaultFormData.stack, ...initialData?.stack },
    instructions: { ...defaultFormData.instructions, ...initialData?.instructions },
    operations: { ...defaultFormData.operations, ...initialData?.operations },
    security: { ...defaultFormData.security, ...initialData?.security },
    documentation: { ...defaultFormData.documentation, ...initialData?.documentation },
    portfolio: { ...defaultFormData.portfolio, ...initialData?.portfolio },
  });
  const [serviceInput, setServiceInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [tagInput, setTagInput] = useState('');
  const [teamInput, setTeamInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = mode === 'create' ? '/api/admin/projects' : `/api/admin/projects/${initialData?.id}`;
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

      router.push('/admin/projects');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addTeamMember = () => {
    if (teamInput.trim() && !formData.team.includes(teamInput.trim())) {
      setFormData(prev => ({ ...prev, team: [...prev.team, teamInput.trim()] }));
      setTeamInput('');
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({ ...prev, team: prev.team.filter(t => t !== member) }));
  };

  const addProductUrl = () => {
    if (urlInput.trim()) {
      setFormData(prev => ({ ...prev, productUrls: [...prev.productUrls, urlInput.trim()] }));
      setUrlInput('');
    }
  };

  const removeProductUrl = (url: string) => {
    setFormData(prev => ({ ...prev, productUrls: prev.productUrls.filter(u => u !== url) }));
  };

  const addEnvironment = () => {
    setFormData(prev => ({
      ...prev,
      environments: [...prev.environments, { type: 'DEV', url: '', notes: '' }],
    }));
  };

  const updateEnvironment = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      environments: prev.environments.map((env, i) => i === index ? { ...env, [field]: value } : env),
    }));
  };

  const removeEnvironment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      environments: prev.environments.filter((_, i) => i !== index),
    }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { type: 'OTHER', label: '', url: '', notes: '' }],
    }));
  };

  const updateLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link),
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const inputClass = "w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none";
  const labelClass = "block text-white/60 text-sm mb-1";
  const sectionClass = "bg-surface rounded-lg p-6 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-white/10 pb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'bg-surface text-white/60 hover:bg-surface-hover'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">Project Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Project Key *</label>
              <input
                type="text"
                value={formData.key}
                onChange={e => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                className={inputClass}
                placeholder="my-project"
                required
              />
              <p className="text-white/40 text-xs mt-1">Lowercase, alphanumeric with hyphens</p>
            </div>
            <div>
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass}
                placeholder="Project Name"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={e => setFormData(prev => ({ ...prev, client: e.target.value }))}
                className={inputClass}
                placeholder="Client name or 'Internal Product'"
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Project Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ProjectType }))}
                className={inputClass}
              >
                <option value="client">Client Project</option>
                <option value="internal">Internal Product</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={e => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                className={inputClass}
                placeholder="Product Owner"
              />
            </div>
            <div>
              <label className={labelClass}>Tech Lead</label>
              <input
                type="text"
                value={formData.techLead}
                onChange={e => setFormData(prev => ({ ...prev, techLead: e.target.value }))}
                className={inputClass}
                placeholder="Technical Lead"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>One-liner *</label>
            <input
              type="text"
              value={formData.oneLiner}
              onChange={e => setFormData(prev => ({ ...prev, oneLiner: e.target.value }))}
              className={inputClass}
              placeholder="Brief description of the project"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Essence *</label>
            <textarea
              value={formData.essence}
              onChange={e => setFormData(prev => ({ ...prev, essence: e.target.value }))}
              className={`${inputClass} h-24`}
              placeholder="Detailed description of what the project is about"
              required
            />
          </div>

          {/* Product URLs */}
          <div>
            <label className={labelClass}>Product URLs</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addProductUrl())}
                className={`${inputClass} flex-1`}
                placeholder="https://example.com"
              />
              <button type="button" onClick={addProductUrl} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.productUrls.map(url => (
                <span key={url} className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                  {url}
                  <button type="button" onClick={() => removeProductUrl(url)} className="hover:text-red-400">x</button>
                </span>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <label className={labelClass}>Team Members</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={teamInput}
                onChange={e => setTeamInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                className={`${inputClass} flex-1`}
                placeholder="Team member name"
              />
              <button type="button" onClick={addTeamMember} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.team.map(member => (
                <span key={member} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {member}
                  <button type="button" onClick={() => removeTeamMember(member)} className="hover:text-red-400">x</button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className={`${inputClass} flex-1`}
                placeholder="Add tag"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">x</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Portfolio Settings</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={`text-sm ${formData.portfolio.published ? 'text-green-400' : 'text-white/60'}`}>
                {formData.portfolio.published ? 'Published to Portfolio' : 'Not Published'}
              </span>
              <div
                onClick={() => setFormData(prev => ({
                  ...prev,
                  portfolio: { ...prev.portfolio, published: !prev.portfolio.published }
                }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.portfolio.published ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.portfolio.published ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>

          {formData.portfolio.published && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Portfolio Slug</label>
                  <input
                    type="text"
                    value={formData.portfolio.slug || formData.key}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }
                    }))}
                    className={inputClass}
                    placeholder="project-slug"
                  />
                  <p className="text-white/40 text-xs mt-1">URL: /portfolio/{formData.portfolio.slug || formData.key || 'slug'}</p>
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <input
                    type="text"
                    value={formData.portfolio.industry}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, industry: e.target.value }
                    }))}
                    className={inputClass}
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>
                <div>
                  <label className={labelClass}>Year</label>
                  <input
                    type="number"
                    value={formData.portfolio.year}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, year: parseInt(e.target.value) || new Date().getFullYear() }
                    }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Display Order</label>
                  <input
                    type="number"
                    value={formData.portfolio.order}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, order: parseInt(e.target.value) || 0 }
                    }))}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className={labelClass}>Portfolio Categories</label>
                <div className="flex flex-wrap gap-2">
                  {PORTFOLIO_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const categories = formData.portfolio.categories || [];
                        const newCategories = categories.includes(cat)
                          ? categories.filter(c => c !== cat)
                          : [...categories, cat];
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, categories: newCategories }
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        (formData.portfolio.categories || []).includes(cat)
                          ? 'bg-accent text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.portfolio.showOnHomepage}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, showOnHomepage: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-white/80 text-sm">Show on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.portfolio.hidden}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, hidden: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-white/80 text-sm">Hidden from Portfolio</span>
                </label>
              </div>

              {/* Thumbnail */}
              <div>
                <label className={labelClass}>Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.portfolio.thumbnail}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    portfolio: { ...prev.portfolio, thumbnail: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>

              {/* Gallery Images */}
              <div>
                <label className={labelClass}>Gallery Images</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (imageInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            portfolio: { ...prev.portfolio, images: [...(prev.portfolio.images || []), imageInput.trim()] }
                          }));
                          setImageInput('');
                        }
                      }
                    }}
                    className={`${inputClass} flex-1`}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageInput.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, images: [...(prev.portfolio.images || []), imageInput.trim()] }
                        }));
                        setImageInput('');
                      }
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.portfolio.images || []).map((img, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm max-w-xs truncate">
                      {img}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, images: prev.portfolio.images.filter((_, idx) => idx !== i) }
                        }))}
                        className="hover:text-red-400"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className={labelClass}>Services Provided</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={e => setServiceInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (serviceInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            portfolio: { ...prev.portfolio, services: [...(prev.portfolio.services || []), serviceInput.trim()] }
                          }));
                          setServiceInput('');
                        }
                      }
                    }}
                    className={`${inputClass} flex-1`}
                    placeholder="e.g., Web Development, UI/UX Design"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (serviceInput.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, services: [...(prev.portfolio.services || []), serviceInput.trim()] }
                        }));
                        setServiceInput('');
                      }
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.portfolio.services || []).map((svc, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {svc}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, services: prev.portfolio.services.filter((_, idx) => idx !== i) }
                        }))}
                        className="hover:text-red-400"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className={labelClass}>Full Description (Portfolio Page)</label>
                <textarea
                  value={formData.portfolio.fullDescription}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    portfolio: { ...prev.portfolio, fullDescription: e.target.value }
                  }))}
                  className={`${inputClass} h-24`}
                  placeholder="Detailed description for the portfolio page..."
                />
              </div>

              {/* Challenge */}
              <div>
                <label className={labelClass}>Challenge</label>
                <textarea
                  value={formData.portfolio.challenge}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    portfolio: { ...prev.portfolio, challenge: e.target.value }
                  }))}
                  className={`${inputClass} h-24`}
                  placeholder="What challenge did the client face?"
                />
              </div>

              {/* Solution */}
              <div>
                <label className={labelClass}>Solution</label>
                <textarea
                  value={formData.portfolio.solution}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    portfolio: { ...prev.portfolio, solution: e.target.value }
                  }))}
                  className={`${inputClass} h-24`}
                  placeholder="How did you solve it?"
                />
              </div>

              {/* Results */}
              <div>
                <label className={labelClass}>Results / Key Metrics</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={resultInput}
                    onChange={e => setResultInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (resultInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            portfolio: { ...prev.portfolio, results: [...(prev.portfolio.results || []), resultInput.trim()] }
                          }));
                          setResultInput('');
                        }
                      }
                    }}
                    className={`${inputClass} flex-1`}
                    placeholder="e.g., 50% increase in conversions"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (resultInput.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, results: [...(prev.portfolio.results || []), resultInput.trim()] }
                        }));
                        setResultInput('');
                      }
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.portfolio.results || []).map((res, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {res}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, results: prev.portfolio.results.filter((_, idx) => idx !== i) }
                        }))}
                        className="hover:text-red-400"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Client Testimonial (Optional)</h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Quote</label>
                    <textarea
                      value={formData.portfolio.testimonial?.quote || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        portfolio: {
                          ...prev.portfolio,
                          testimonial: { ...(prev.portfolio.testimonial || { quote: '', author: '', role: '' }), quote: e.target.value }
                        }
                      }))}
                      className={`${inputClass} h-20`}
                      placeholder="What the client said..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Author</label>
                      <input
                        type="text"
                        value={formData.portfolio.testimonial?.author || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            testimonial: { ...(prev.portfolio.testimonial || { quote: '', author: '', role: '' }), author: e.target.value }
                          }
                        }))}
                        className={inputClass}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Role</label>
                      <input
                        type="text"
                        value={formData.portfolio.testimonial?.role || ''}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            testimonial: { ...(prev.portfolio.testimonial || { quote: '', author: '', role: '' }), role: e.target.value }
                          }
                        }))}
                        className={inputClass}
                        placeholder="CEO at Company"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!formData.portfolio.published && (
            <p className="text-white/40 text-sm">
              Enable publishing to add this project to your public portfolio. Portfolio-specific fields will appear here.
            </p>
          )}
        </div>
      )}

      {/* Stack Tab */}
      {activeTab === 'stack' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">Tech Stack</h2>

          {(['frontend', 'backend', 'database'] as const).map(layer => (
            <div key={layer} className="border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-medium capitalize mb-3">{layer}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={formData.stack[layer].name}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      stack: { ...prev.stack, [layer]: { ...prev.stack[layer], name: e.target.value } }
                    }))}
                    className={inputClass}
                    placeholder={`e.g., ${layer === 'frontend' ? 'Next.js' : layer === 'backend' ? 'Node.js' : 'PostgreSQL'}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Version</label>
                  <input
                    type="text"
                    value={formData.stack[layer].version}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      stack: { ...prev.stack, [layer]: { ...prev.stack[layer], version: e.target.value } }
                    }))}
                    className={inputClass}
                    placeholder="e.g., 14.0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <input
                    type="text"
                    value={formData.stack[layer].notes}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      stack: { ...prev.stack, [layer]: { ...prev.stack[layer], notes: e.target.value } }
                    }))}
                    className={inputClass}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>
          ))}

          {(['hosting', 'auth', 'cicd', 'analytics', 'monitoring'] as const).map(service => (
            <div key={service} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{service.toUpperCase()} Provider</label>
                <input
                  type="text"
                  value={formData.stack[service]?.name || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    stack: { ...prev.stack, [service]: { ...prev.stack[service], name: e.target.value } }
                  }))}
                  className={inputClass}
                  placeholder={`e.g., ${service === 'hosting' ? 'Vercel' : service === 'auth' ? 'Firebase Auth' : service === 'cicd' ? 'GitHub Actions' : service === 'analytics' ? 'Google Analytics' : 'Sentry'}`}
                />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <input
                  type="text"
                  value={formData.stack[service]?.notes || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    stack: { ...prev.stack, [service]: { ...prev.stack[service], notes: e.target.value } }
                  }))}
                  className={inputClass}
                  placeholder="Additional notes"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Environments Tab */}
      {activeTab === 'environments' && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Environments</h2>
            <button type="button" onClick={addEnvironment} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
              + Add Environment
            </button>
          </div>

          {formData.environments.length === 0 ? (
            <p className="text-white/40">No environments configured</p>
          ) : (
            <div className="space-y-4">
              {formData.environments.map((env, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>Type</label>
                      <select
                        value={env.type}
                        onChange={e => updateEnvironment(index, 'type', e.target.value)}
                        className={inputClass}
                      >
                        {ENV_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>URL</label>
                      <input
                        type="url"
                        value={env.url}
                        onChange={e => updateEnvironment(index, 'url', e.target.value)}
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={labelClass}>Notes</label>
                        <input
                          type="text"
                          value={env.notes}
                          onChange={e => updateEnvironment(index, 'notes', e.target.value)}
                          className={inputClass}
                          placeholder="Notes"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEnvironment(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        x
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Links Registry</h2>
            <button type="button" onClick={addLink} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
              + Add Link
            </button>
          </div>
          <p className="text-white/40 text-sm">Add links to repos, trackers, design tools, hosting consoles, etc.</p>

          {formData.links.length === 0 ? (
            <p className="text-white/40">No links added</p>
          ) : (
            <div className="space-y-4">
              {formData.links.map((link, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className={labelClass}>Type</label>
                      <select
                        value={link.type}
                        onChange={e => updateLink(index, 'type', e.target.value)}
                        className={inputClass}
                      >
                        {LINK_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={e => updateLink(index, 'label', e.target.value)}
                        className={inputClass}
                        placeholder="Display name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={e => updateLink(index, 'url', e.target.value)}
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={labelClass}>Notes</label>
                        <input
                          type="text"
                          value={link.notes}
                          onChange={e => updateLink(index, 'notes', e.target.value)}
                          className={inputClass}
                          placeholder="Notes"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        x
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions Tab */}
      {activeTab === 'instructions' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">Instructions & Runbooks</h2>
          <p className="text-white/40 text-sm">Markdown supported for all fields</p>

          {(['localSetupMd', 'deployMd', 'testingMd', 'runbookMd', 'knownIssuesMd'] as const).map(field => (
            <div key={field}>
              <label className={labelClass}>
                {field === 'localSetupMd' ? 'Local Setup' :
                 field === 'deployMd' ? 'Deployment' :
                 field === 'testingMd' ? 'Testing' :
                 field === 'runbookMd' ? 'Runbook' : 'Known Issues'}
              </label>
              <textarea
                value={formData.instructions[field]}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  instructions: { ...prev.instructions, [field]: e.target.value }
                }))}
                className={`${inputClass} h-40 font-mono text-sm`}
                placeholder="Markdown content..."
              />
            </div>
          ))}
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'docs' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">Developer Documentation</h2>
          <p className="text-white/40 text-sm">Critical documentation for developers. Markdown supported.</p>

          <div>
            <label className={labelClass}>Environment Variables Template</label>
            <p className="text-white/40 text-xs mb-2">Document all required env vars for .env.example files</p>
            <textarea
              value={formData.documentation.envVarsTemplate}
              onChange={e => setFormData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, envVarsTemplate: e.target.value }
              }))}
              className={`${inputClass} h-48 font-mono text-sm`}
              placeholder="## Environment Variables..."
            />
          </div>

          <div>
            <label className={labelClass}>Database Schema</label>
            <p className="text-white/40 text-xs mb-2">Document the Prisma schema or add ERD links</p>
            <textarea
              value={formData.documentation.databaseSchema}
              onChange={e => setFormData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, databaseSchema: e.target.value }
              }))}
              className={`${inputClass} h-40 font-mono text-sm`}
              placeholder="## Database Schema..."
            />
          </div>

          <div>
            <label className={labelClass}>API Endpoints</label>
            <p className="text-white/40 text-xs mb-2">Quick reference of all API routes</p>
            <textarea
              value={formData.documentation.apiEndpoints}
              onChange={e => setFormData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, apiEndpoints: e.target.value }
              }))}
              className={`${inputClass} h-40 font-mono text-sm`}
              placeholder="## API Endpoints..."
            />
          </div>

          <div>
            <label className={labelClass}>Test Users / Seed Data</label>
            <p className="text-white/40 text-xs mb-2">Document test accounts and how to seed them</p>
            <textarea
              value={formData.documentation.seedData}
              onChange={e => setFormData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, seedData: e.target.value }
              }))}
              className={`${inputClass} h-40 font-mono text-sm`}
              placeholder="## Test Users & Seed Data..."
            />
          </div>

          <div>
            <label className={labelClass}>Changelog</label>
            <p className="text-white/40 text-xs mb-2">Track what changed between versions</p>
            <textarea
              value={formData.documentation.changelog}
              onChange={e => setFormData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, changelog: e.target.value }
              }))}
              className={`${inputClass} h-40 font-mono text-sm`}
              placeholder="## Changelog..."
            />
          </div>

          <div>
            <label className={labelClass}>CI/CD Pipeline</label>
            <p className="text-white/40 text-xs mb-2">GitHub Actions and deployment automation</p>
            <textarea
              value={formData.documentation.cicdPipeline}
              onChange={e => setFormData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, cicdPipeline: e.target.value }
              }))}
              className={`${inputClass} h-40 font-mono text-sm`}
              placeholder="## CI/CD Pipeline..."
            />
          </div>
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">Operations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>SLA</label>
              <input
                type="text"
                value={formData.operations.sla}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  operations: { ...prev.operations, sla: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., 99.9% uptime"
              />
            </div>
            <div>
              <label className={labelClass}>Backups</label>
              <input
                type="text"
                value={formData.operations.backups}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  operations: { ...prev.operations, backups: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., Daily automated backups"
              />
            </div>
            <div>
              <label className={labelClass}>PII Level</label>
              <select
                value={formData.operations.pii}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  operations: { ...prev.operations, pii: e.target.value as PIILevel }
                }))}
                className={inputClass}
              >
                {PII_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Data Region</label>
              <input
                type="text"
                value={formData.operations.dataRegion}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  operations: { ...prev.operations, dataRegion: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., US-East, EU-West"
              />
            </div>
            <div>
              <label className={labelClass}>Secrets Location</label>
              <input
                type="text"
                value={formData.operations.secretsLocation}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  operations: { ...prev.operations, secretsLocation: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., 1Password vault: ProjectName"
              />
              <p className="text-white/40 text-xs mt-1">Reference only, do NOT store actual secrets</p>
            </div>
            <div>
              <label className={labelClass}>On-Call Rotation</label>
              <input
                type="text"
                value={formData.operations.onCallRotation}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  operations: { ...prev.operations, onCallRotation: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., PagerDuty schedule link"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Incident Process</label>
            <textarea
              value={formData.operations.incidentProcess}
              onChange={e => setFormData(prev => ({
                ...prev,
                operations: { ...prev.operations, incidentProcess: e.target.value }
              }))}
              className={`${inputClass} h-24`}
              placeholder="Describe the incident response process"
            />
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">Security</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Authentication Method</label>
              <input
                type="text"
                value={formData.security.authMethod}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  security: { ...prev.security, authMethod: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., OAuth 2.0, JWT"
              />
            </div>
            <div>
              <label className={labelClass}>Data Encryption</label>
              <input
                type="text"
                value={formData.security.dataEncryption}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  security: { ...prev.security, dataEncryption: e.target.value }
                }))}
                className={inputClass}
                placeholder="e.g., AES-256 at rest, TLS in transit"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Compliance Notes</label>
            <textarea
              value={formData.security.complianceNotes}
              onChange={e => setFormData(prev => ({
                ...prev,
                security: { ...prev.security, complianceNotes: e.target.value }
              }))}
              className={`${inputClass} h-24`}
              placeholder="e.g., GDPR, HIPAA, SOC 2 requirements"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-4 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
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
