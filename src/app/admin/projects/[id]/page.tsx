'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProjectForm } from '@/components/admin/projects/project-form';
import { PortfolioForm, PortfolioFormData, defaultPortfolioData } from '@/components/admin/portfolio/portfolio-form';

type ProjectStatus = 'active' | 'maintenance' | 'paused' | 'archived' | 'completed';

interface Project {
  id: string;
  key: string;
  name: string;
  client?: string;
  status: ProjectStatus;
  oneLiner: string;
  essence: string;
  productUrls: string[];
  owner?: string;
  techLead?: string;
  team: string[];
  tags: string[];
  stack: any;
  environments: any[];
  links: any[];
  instructions: any;
  operations: any;
  security?: any;
  documentation?: {
    envVarsTemplate: string;
    databaseSchema: string;
    apiEndpoints: string;
    seedData: string;
    changelog: string;
    cicdPipeline: string;
  };
  portfolio?: {
    published?: boolean;
    slug?: string;
    categories?: string[];
    tags?: string[];
    thumbnail?: string;
    images?: string[];
    industry?: string;
    year?: number;
    services?: string[];
    technologies?: string[];
    fullDescription?: string;
    challenge?: string;
    solution?: string;
    results?: string[];
    testimonial?: { quote: string; author: string; role: string } | null;
    order?: number;
    hidden?: boolean;
    showOnHomepage?: boolean;
    isLegacy?: boolean; // True if data comes from legacy portfolio collection
  };
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  activityLog?: Array<{
    id: string;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    timestamp: string;
    userEmail: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  maintenance: 'bg-blue-500/20 text-blue-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  archived: 'bg-gray-500/20 text-gray-400',
  completed: 'bg-purple-500/20 text-purple-400',
};

type TabType = 'overview' | 'portfolio' | 'stack' | 'environments' | 'links' | 'instructions' | 'docs' | 'operations' | 'security' | 'activity';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'overview');
  const [exporting, setExporting] = useState(false);
  const [togglingPortfolio, setTogglingPortfolio] = useState(false);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  // Update tab from URL parameter
  useEffect(() => {
    if (tabParam && ['overview', 'portfolio', 'stack', 'environments', 'links', 'instructions', 'docs', 'operations', 'security', 'activity'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const togglePortfolioPublish = async (publish: boolean) => {
    if (!project) return;
    setTogglingPortfolio(true);
    try {
      const res = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: {
            published: publish,
            slug: project.portfolio?.slug || project.key,
          }
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setProject(data.project);
    } catch (err) {
      alert('Failed to update portfolio status');
    } finally {
      setTogglingPortfolio(false);
    }
  };

  const toggleFeatured = async (featured: boolean) => {
    if (!project) return;
    setTogglingPortfolio(true);
    try {
      const res = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: { showOnHomepage: featured }
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setProject(data.project);
    } catch (err) {
      alert('Failed to update featured status');
    } finally {
      setTogglingPortfolio(false);
    }
  };

  const syncFromLegacy = async () => {
    if (!project) return;
    if (!confirm('This will copy portfolio data from the legacy portfolio collection to this project. Continue?')) return;

    setTogglingPortfolio(true);
    try {
      const res = await fetch(`/api/admin/projects/${params.id}/sync-portfolio`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to sync');
      }
      const data = await res.json();
      setProject(data.project);
      alert('Portfolio data synced successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sync portfolio');
    } finally {
      setTogglingPortfolio(false);
    }
  };

  const savePortfolio = async (portfolioData: PortfolioFormData) => {
    if (!project) return;
    setSavingPortfolio(true);
    setPortfolioError(null);
    try {
      const res = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: {
            published: portfolioData.status === 'published',
            slug: portfolioData.slug,
            categories: portfolioData.categories,
            tags: portfolioData.tags,
            thumbnail: portfolioData.thumbnail,
            images: portfolioData.images,
            industry: portfolioData.industry,
            year: portfolioData.year,
            services: portfolioData.services,
            technologies: portfolioData.technologies,
            fullDescription: portfolioData.fullDescription,
            challenge: portfolioData.challenge,
            solution: portfolioData.solution,
            results: portfolioData.results,
            testimonial: portfolioData.testimonial,
            order: portfolioData.order,
            hidden: portfolioData.hidden,
            showOnHomepage: portfolioData.showOnHomepage,
          }
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      const data = await res.json();
      setProject(data.project);
      alert('Portfolio saved!');
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : 'Failed to save portfolio');
    } finally {
      setSavingPortfolio(false);
    }
  };

  // Convert project to portfolio form data
  const getPortfolioFormData = (): Partial<PortfolioFormData> => {
    if (!project) return {};
    const p = project.portfolio || {};
    // When adding to portfolio (no existing portfolio data), default to published
    // so the item actually appears in the portfolio list when saved
    const isNewPortfolio = !project.portfolio?.published && !project.portfolio?.slug;

    // Extract technologies from stack
    const stackTechnologies: string[] = [];
    if (project.stack) {
      if (project.stack.frontend?.name) stackTechnologies.push(project.stack.frontend.name);
      if (project.stack.backend?.name) stackTechnologies.push(project.stack.backend.name);
      if (project.stack.database?.name) stackTechnologies.push(project.stack.database.name);
      if (project.stack.hosting?.name) stackTechnologies.push(project.stack.hosting.name);
      if (project.stack.auth?.name) stackTechnologies.push(project.stack.auth.name);
      if (project.stack.cicd?.name) stackTechnologies.push(project.stack.cicd.name);
      if (project.stack.analytics?.name) stackTechnologies.push(project.stack.analytics.name);
      if (project.stack.monitoring?.name) stackTechnologies.push(project.stack.monitoring.name);
    }
    // Filter out TBD and empty values
    const filteredTechnologies = stackTechnologies.filter(t => t && t !== 'TBD');

    // Map tags that might indicate categories
    const tagCategoryMap: Record<string, 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile'> = {
      'web': 'web',
      'web-app': 'web',
      'webapp': 'web',
      'web-development': 'web',
      'website': 'web',
      'ecommerce': 'e-commerce',
      'e-commerce': 'e-commerce',
      'shop': 'e-commerce',
      'store': 'e-commerce',
      'branding': 'branding',
      'brand': 'branding',
      'marketing': 'marketing',
      'mobile': 'mobile',
      'app': 'mobile',
      'ios': 'mobile',
      'android': 'mobile',
    };

    // Auto-detect categories from tags if no categories set
    let categories = (p.categories || []) as ('web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile')[];
    if (categories.length === 0 && project.tags) {
      const detectedCategories = new Set<'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile'>();
      for (const tag of project.tags) {
        const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
        if (tagCategoryMap[normalizedTag]) {
          detectedCategories.add(tagCategoryMap[normalizedTag]);
        }
      }
      categories = Array.from(detectedCategories);
    }

    return {
      slug: p.slug || project.key,
      name: project.name,
      description: project.oneLiner,
      fullDescription: p.fullDescription || project.essence,
      categories,
      tags: p.tags?.length ? p.tags : (project.tags || []),
      thumbnail: p.thumbnail || '',
      images: p.images || [],
      client: project.client || '',
      industry: p.industry || '',
      year: p.year || new Date().getFullYear(),
      services: p.services || [],
      technologies: p.technologies?.length ? p.technologies : filteredTechnologies,
      liveUrl: project.productUrls?.[0] || '',
      challenge: p.challenge || '',
      solution: p.solution || '',
      results: p.results || [],
      testimonial: p.testimonial || null,
      order: p.order || 0,
      status: isNewPortfolio ? 'published' : (p.published ? 'published' : 'draft'),
      hidden: p.hidden || false,
      showOnHomepage: p.showOnHomepage || false,
    };
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/projects/${params.id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'xlsx' | 'json' = 'xlsx') => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/projects/export?id=${params.id}&format=${format}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${project?.key || params.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-white/60">Loading...</div>;
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
        <Link href="/admin/projects" className="text-accent hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div>
        <div className="mb-8">
          <button onClick={() => setMode('view')} className="text-white/60 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to View
          </button>
          <h1 className="text-2xl font-bold text-white">Edit: {project.name}</h1>
        </div>
        <ProjectForm mode="edit" initialData={project as any} />
      </div>
    );
  }

  const TABS = ['overview', 'portfolio', 'stack', 'environments', 'links', 'instructions', 'docs', 'operations', 'security', 'activity'] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/admin/projects" className="text-white/60 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Projects
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <span className={`px-2 py-1 rounded text-xs capitalize ${STATUS_COLORS[project.status] || 'bg-gray-500/20 text-gray-400'}`}>
              {project.status}
            </span>
            {project.portfolio?.published && (
              <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                Portfolio
              </span>
            )}
            {project.portfolio?.showOnHomepage && (
              <span className="px-2 py-1 rounded text-xs bg-accent/20 text-accent">
                Featured
              </span>
            )}
          </div>
          <p className="text-white/60 mt-1">{project.oneLiner}</p>
          {project.tags?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {exporting ? '...' : 'JSON'}
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {exporting ? '...' : 'Excel'}
          </button>
          <button
            onClick={() => setMode('edit')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Edit Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-white/10 pb-4 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
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
        <div className="space-y-6">
          <div className="bg-surface rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Project Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Key" value={project.key} />
              <InfoRow label="Client" value={project.client || '-'} />
              <InfoRow label="Owner" value={project.owner || 'TBD'} />
              <InfoRow label="Tech Lead" value={project.techLead || 'TBD'} />
            </div>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Essence</h3>
            <p className="text-white/70 whitespace-pre-wrap">{project.essence}</p>
          </div>

          {project.productUrls?.length > 0 && (
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Product URLs</h3>
              <div className="space-y-2">
                {project.productUrls.map(url => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block text-accent hover:underline">
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {project.team?.length > 0 && (
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Team</h3>
              <div className="flex flex-wrap gap-2">
                {project.team.map(member => (
                  <span key={member} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {member}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {/* Legacy Sync Alert */}
          {project.portfolio?.isLegacy && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 font-medium">Legacy Portfolio Data Detected</p>
                  <p className="text-yellow-400/70 text-sm mt-1">
                    This project has portfolio data in the legacy collection. Sync it to enable full editing.
                  </p>
                </div>
                <button
                  onClick={syncFromLegacy}
                  disabled={togglingPortfolio}
                  className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {togglingPortfolio ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            </div>
          )}

          {/* Portfolio Form - same as Portfolio edit page */}
          <PortfolioForm
            initialData={getPortfolioFormData()}
            onSubmit={savePortfolio}
            onCancel={() => setActiveTab('overview')}
            submitLabel="Save Portfolio"
            saving={savingPortfolio}
            error={portfolioError}
          />
        </div>
      )}

      {/* Stack Tab */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          {project.stack && (
            <>
              {['frontend', 'backend', 'database'].map(layer => (
                <div key={layer} className="bg-surface rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white capitalize mb-4">{layer}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoRow label="Name" value={project.stack[layer]?.name || 'TBD'} />
                    <InfoRow label="Version" value={project.stack[layer]?.version || '-'} />
                    <InfoRow label="Notes" value={project.stack[layer]?.notes || '-'} />
                  </div>
                </div>
              ))}

              <div className="bg-surface rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['hosting', 'auth', 'cicd', 'analytics', 'monitoring'].map(service => (
                    <InfoRow
                      key={service}
                      label={service.toUpperCase()}
                      value={project.stack[service]?.name || 'TBD'}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Environments Tab */}
      {activeTab === 'environments' && (
        <div className="bg-surface rounded-lg border border-white/10 overflow-hidden">
          {project.environments?.length > 0 ? (
            <table className="w-full">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">URL</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {project.environments.map((env, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {env.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={env.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {env.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-white/60">{env.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-white/40 p-6">No environments configured</p>
          )}
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="bg-surface rounded-lg border border-white/10 overflow-hidden">
          {project.links?.length > 0 ? (
            <table className="w-full">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Label</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">URL</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {project.links.map((link, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {link.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{link.label}</td>
                    <td className="px-4 py-3">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate block max-w-xs">
                        {link.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-white/60">{link.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-white/40 p-6">No links added</p>
          )}
        </div>
      )}

      {/* Instructions Tab */}
      {activeTab === 'instructions' && (
        <div className="space-y-6">
          {project.instructions && (
            <>
              <MarkdownSection title="Local Setup" content={project.instructions.localSetupMd} />
              <MarkdownSection title="Deployment" content={project.instructions.deployMd} />
              <MarkdownSection title="Testing" content={project.instructions.testingMd} />
              <MarkdownSection title="Runbook" content={project.instructions.runbookMd} />
              <MarkdownSection title="Known Issues" content={project.instructions.knownIssuesMd} />
            </>
          )}
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          {project.documentation ? (
            <>
              <MarkdownSection title="Environment Variables Template" content={project.documentation.envVarsTemplate} />
              <MarkdownSection title="Database Schema" content={project.documentation.databaseSchema} />
              <MarkdownSection title="API Endpoints" content={project.documentation.apiEndpoints} />
              <MarkdownSection title="Test Users / Seed Data" content={project.documentation.seedData} />
              <MarkdownSection title="Changelog" content={project.documentation.changelog} />
              <MarkdownSection title="CI/CD Pipeline" content={project.documentation.cicdPipeline} />
            </>
          ) : (
            <div className="bg-surface rounded-lg p-6 border border-white/10">
              <p className="text-white/40">No developer documentation added yet. Click Edit to add documentation.</p>
            </div>
          )}
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className="bg-surface rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Operations</h3>
          {project.operations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="SLA" value={project.operations.sla || 'TBD'} />
              <InfoRow label="Backups" value={project.operations.backups || 'TBD'} />
              <InfoRow label="PII Level" value={project.operations.pii || 'unknown'} highlight />
              <InfoRow label="Data Region" value={project.operations.dataRegion || 'TBD'} />
              <InfoRow label="Secrets Location" value={project.operations.secretsLocation || 'Not specified'} />
              <InfoRow label="On-Call Rotation" value={project.operations.onCallRotation || 'TBD'} />
            </div>
          )}
          {project.operations?.incidentProcess && (
            <div className="mt-4">
              <h4 className="text-white/60 text-sm mb-2">Incident Process</h4>
              <p className="text-white/70 whitespace-pre-wrap">{project.operations.incidentProcess}</p>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-surface rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
          {project.security ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Auth Method" value={project.security.authMethod || 'TBD'} />
                <InfoRow label="Data Encryption" value={project.security.dataEncryption || 'TBD'} />
              </div>
              {project.security.complianceNotes && (
                <div className="mt-4">
                  <h4 className="text-white/60 text-sm mb-2">Compliance Notes</h4>
                  <p className="text-white/70 whitespace-pre-wrap">{project.security.complianceNotes}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-white/40">No security information documented</p>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-surface rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Log</h3>
          {project.activityLog && project.activityLog.length > 0 ? (
            <div className="space-y-3">
              {project.activityLog.slice().reverse().map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-surface-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-medium">{log.userEmail}</span>
                      {' '}
                      <span className="text-white/60">{log.action}</span>
                      {log.field && <span className="text-white/60"> {log.field}</span>}
                      {log.oldValue && log.newValue && (
                        <span className="text-white/40">
                          : {log.oldValue} → {log.newValue}
                        </span>
                      )}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40">No activity recorded</p>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Created" value={project.createdAt ? new Date(project.createdAt).toLocaleString() : '-'} />
              <InfoRow label="Last Updated" value={project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '-'} />
              <InfoRow label="Updated By" value={project.updatedBy || '-'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-white/40 text-sm">{label}</span>
      <p className={`text-white ${highlight ? 'font-medium' : ''}`}>{value}</p>
    </div>
  );
}

function MarkdownSection({ title, content }: { title: string; content?: string }) {
  if (!content) return null;

  return (
    <div className="bg-surface rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="prose prose-invert prose-sm max-w-none">
        <pre className="whitespace-pre-wrap text-white/70 font-sans text-sm">{content}</pre>
      </div>
    </div>
  );
}
