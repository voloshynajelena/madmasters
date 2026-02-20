'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProjectForm } from '@/components/admin/projects/project-form';

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState<'overview' | 'stack' | 'environments' | 'links' | 'instructions' | 'operations' | 'security' | 'activity'>('overview');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/projects/export?id=${params.id}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${project?.key || params.id}.xlsx`;
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
        <ProjectForm mode="edit" initialData={project} />
      </div>
    );
  }

  const TABS = ['overview', 'stack', 'environments', 'links', 'instructions', 'operations', 'security', 'activity'] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/admin/projects" className="text-white/60 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <span className={`px-2 py-1 rounded text-xs capitalize ${STATUS_COLORS[project.status] || 'bg-gray-500/20 text-gray-400'}`}>
              {project.status}
            </span>
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
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export'}
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
