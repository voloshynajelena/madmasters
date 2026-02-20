'use client';

import { useEffect, useState } from 'react';

interface CompanySettings {
  company: {
    name: string;
    legalName: string;
    tagline: string;
    description: string;
    founded: string;
    website: string;
    email: string;
    phone: string;
    address: string;
  };
  project: {
    name: string;
    repository: string;
    stack: {
      framework: string;
      language: string;
      styling: string;
      database: string;
      auth: string;
      hosting: string;
      storage: string;
    };
    features: string[];
  };
  integrations: {
    telegram: {
      enabled: boolean;
      botUsername: string;
      botName: string;
      chatId: string;
      description: string;
    };
    firebase: {
      enabled: boolean;
      projectId: string;
      services: string[];
    };
    vercel: {
      enabled: boolean;
      projectName: string;
      description: string;
    };
    github: {
      enabled: boolean;
      repoUrl: string;
      username: string;
      description: string;
    };
    appStore: {
      enabled: boolean;
      description: string;
    };
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
    twitterHandle: string;
    googleAnalyticsId: string;
  };
  updatedAt?: string;
  updatedBy?: string;
}

const defaultSettings: CompanySettings = {
  company: {
    name: '',
    legalName: '',
    tagline: '',
    description: '',
    founded: '',
    website: '',
    email: '',
    phone: '',
    address: '',
  },
  project: {
    name: '',
    repository: '',
    stack: {
      framework: '',
      language: '',
      styling: '',
      database: '',
      auth: '',
      hosting: '',
      storage: '',
    },
    features: [],
  },
  integrations: {
    telegram: {
      enabled: false,
      botUsername: '',
      botName: '',
      chatId: '',
      description: '',
    },
    firebase: {
      enabled: false,
      projectId: '',
      services: [],
    },
    vercel: {
      enabled: false,
      projectName: '',
      description: '',
    },
    github: {
      enabled: false,
      repoUrl: '',
      username: '',
      description: '',
    },
    appStore: {
      enabled: false,
      description: '',
    },
  },
  seo: {
    defaultTitle: '',
    defaultDescription: '',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
  },
};

type Tab = 'company' | 'project' | 'integrations' | 'seo';

export default function CompanyPage() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/company');
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        fetchSettings();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setSettings(prev => ({
        ...prev,
        project: {
          ...prev.project,
          features: [...prev.project.features, featureInput.trim()],
        },
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setSettings(prev => ({
      ...prev,
      project: {
        ...prev.project,
        features: prev.project.features.filter((_, i) => i !== index),
      },
    }));
  };

  const inputClass = "w-full bg-surface-muted border border-border rounded-lg px-4 py-2 text-foreground placeholder-text-muted focus:border-accent focus:outline-none";
  const labelClass = "block text-text-muted text-sm mb-1";
  const sectionClass = "bg-surface rounded-xl border border-border p-6";

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Details</h1>
          <p className="text-text-muted text-sm mt-1">
            Internal settings and project information
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6 border-b border-border pb-4">
        {(['company', 'project', 'integrations', 'seo'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted hover:bg-surface-hover'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="text-2xl">🏢</span> Company Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                type="text"
                value={settings.company.name}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, name: e.target.value }
                }))}
                className={inputClass}
                placeholder="Mad Masters"
              />
            </div>
            <div>
              <label className={labelClass}>Legal Name</label>
              <input
                type="text"
                value={settings.company.legalName}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, legalName: e.target.value }
                }))}
                className={inputClass}
                placeholder="Mad Masters Web Studio LLC"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Tagline</label>
              <input
                type="text"
                value={settings.company.tagline}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, tagline: e.target.value }
                }))}
                className={inputClass}
                placeholder="We build digital products that matter"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={settings.company.description}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, description: e.target.value }
                }))}
                className={`${inputClass} h-24`}
                placeholder="Company description..."
              />
            </div>
            <div>
              <label className={labelClass}>Founded</label>
              <input
                type="text"
                value={settings.company.founded}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, founded: e.target.value }
                }))}
                className={inputClass}
                placeholder="2024"
              />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input
                type="url"
                value={settings.company.website}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, website: e.target.value }
                }))}
                className={inputClass}
                placeholder="https://madmasters.io"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={settings.company.email}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, email: e.target.value }
                }))}
                className={inputClass}
                placeholder="hello@madmasters.io"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={settings.company.phone}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, phone: e.target.value }
                }))}
                className={inputClass}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={settings.company.address}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  company: { ...prev.company, address: e.target.value }
                }))}
                className={inputClass}
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>
        </div>
      )}

      {/* Project Tab */}
      {activeTab === 'project' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="text-2xl">💻</span> Project Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={labelClass}>Project Name</label>
                <input
                  type="text"
                  value={settings.project.name}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    project: { ...prev.project, name: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="Mad Masters Website"
                />
              </div>
              <div>
                <label className={labelClass}>Repository</label>
                <input
                  type="url"
                  value={settings.project.repository}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    project: { ...prev.project, repository: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <h3 className="text-foreground font-medium mb-4">Tech Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(settings.project.stack).map(([key, value]) => (
                <div key={key}>
                  <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      project: {
                        ...prev.project,
                        stack: { ...prev.project.stack, [key]: e.target.value }
                      }
                    }))}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className="text-foreground font-medium mb-4">Features</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className={`${inputClass} flex-1`}
                placeholder="Add a feature..."
              />
              <button
                onClick={addFeature}
                className="px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-surface-muted"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.project.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                >
                  {feature}
                  <button
                    onClick={() => removeFeature(index)}
                    className="hover:text-red-400"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Telegram */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">📱</span> Telegram Bot
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className={`text-sm ${settings.integrations.telegram.enabled ? 'text-green-400' : 'text-text-muted'}`}>
                  {settings.integrations.telegram.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      telegram: { ...prev.integrations.telegram, enabled: !prev.integrations.telegram.enabled }
                    }
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.integrations.telegram.enabled ? 'bg-green-500' : 'bg-surface-hover'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings.integrations.telegram.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bot Username</label>
                <input
                  type="text"
                  value={settings.integrations.telegram.botUsername}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      telegram: { ...prev.integrations.telegram, botUsername: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="@Madmasters_bot"
                />
              </div>
              <div>
                <label className={labelClass}>Bot Name</label>
                <input
                  type="text"
                  value={settings.integrations.telegram.botName}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      telegram: { ...prev.integrations.telegram, botName: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="Madmasters"
                />
              </div>
              <div>
                <label className={labelClass}>Chat ID</label>
                <input
                  type="text"
                  value={settings.integrations.telegram.chatId}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      telegram: { ...prev.integrations.telegram, chatId: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="422169009"
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  value={settings.integrations.telegram.description}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      telegram: { ...prev.integrations.telegram, description: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="What this bot does..."
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <h4 className="text-cyan-400 font-medium mb-2">Environment Variables</h4>
              <code className="text-xs text-cyan-300 block">
                TELEGRAM_BOT_TOKEN=****<br />
                TELEGRAM_CHAT_ID={settings.integrations.telegram.chatId || '****'}
              </code>
              <p className="text-cyan-400/60 text-xs mt-2">
                Bot token is stored securely in .env.local
              </p>
            </div>
          </div>

          {/* Firebase */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🔥</span> Firebase
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs ${
                settings.integrations.firebase.enabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-surface-hover text-text-muted'
              }`}>
                {settings.integrations.firebase.enabled ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Project ID</label>
                <input
                  type="text"
                  value={settings.integrations.firebase.projectId}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      firebase: { ...prev.integrations.firebase, projectId: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="madmasters-pro"
                />
              </div>
              <div>
                <label className={labelClass}>Services</label>
                <input
                  type="text"
                  value={settings.integrations.firebase.services.join(', ')}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      firebase: {
                        ...prev.integrations.firebase,
                        services: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }
                  }))}
                  className={inputClass}
                  placeholder="Authentication, Firestore, Storage"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <h4 className="text-orange-400 font-medium mb-2">Console Links</h4>
              <div className="space-y-1">
                <a
                  href={`https://console.firebase.google.com/project/${settings.integrations.firebase.projectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-200 text-sm flex items-center gap-1"
                >
                  Firebase Console <span className="text-xs">↗</span>
                </a>
                <a
                  href={`https://console.firebase.google.com/project/${settings.integrations.firebase.projectId}/firestore`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-200 text-sm flex items-center gap-1"
                >
                  Firestore Database <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Vercel */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">▲</span> Vercel
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs ${
                settings.integrations.vercel.enabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-surface-hover text-text-muted'
              }`}>
                {settings.integrations.vercel.enabled ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Project Name</label>
                <input
                  type="text"
                  value={settings.integrations.vercel.projectName}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      vercel: { ...prev.integrations.vercel, projectName: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="madmasters"
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  value={settings.integrations.vercel.description}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      vercel: { ...prev.integrations.vercel, description: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="Hosting and deployment"
                />
              </div>
            </div>
          </div>

          {/* GitHub */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🐙</span> GitHub (Fresh Works)
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className={`text-sm ${settings.integrations.github.enabled ? 'text-green-400' : 'text-text-muted'}`}>
                  {settings.integrations.github.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      github: { ...prev.integrations.github, enabled: !prev.integrations.github.enabled }
                    }
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.integrations.github.enabled ? 'bg-green-500' : 'bg-surface-hover'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings.integrations.github.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>GitHub Username / Org</label>
                <input
                  type="text"
                  value={settings.integrations.github.username}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      github: { ...prev.integrations.github, username: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="madmasters"
                />
              </div>
              <div>
                <label className={labelClass}>Repository URL</label>
                <input
                  type="url"
                  value={settings.integrations.github.repoUrl}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      github: { ...prev.integrations.github, repoUrl: e.target.value }
                    }
                  }))}
                  className={inputClass}
                  placeholder="https://github.com/madmasters/madmasters"
                />
              </div>
            </div>

            <p className="text-text-muted text-sm mb-4">
              Shows recent GitHub activity in Fresh Works section
            </p>

            {settings.integrations.github.repoUrl && (
              <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
                <h4 className="text-foreground font-medium mb-2">Quick Links</h4>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={settings.integrations.github.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-sm flex items-center gap-1"
                  >
                    Repository <span className="text-xs">↗</span>
                  </a>
                  {settings.integrations.github.username && (
                    <>
                      <a
                        href={`https://github.com/${settings.integrations.github.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm flex items-center gap-1"
                      >
                        Profile <span className="text-xs">↗</span>
                      </a>
                      <a
                        href={`https://github.com/${settings.integrations.github.username}?tab=repositories`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm flex items-center gap-1"
                      >
                        All Repos <span className="text-xs">↗</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* App Store */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🍎</span> App Store (Fresh Works)
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className={`text-sm ${settings.integrations.appStore.enabled ? 'text-green-400' : 'text-text-muted'}`}>
                  {settings.integrations.appStore.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    integrations: {
                      ...prev.integrations,
                      appStore: { ...prev.integrations.appStore, enabled: !prev.integrations.appStore.enabled }
                    }
                  }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.integrations.appStore.enabled ? 'bg-green-500' : 'bg-surface-hover'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings.integrations.appStore.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>
            <p className="text-text-muted text-sm">
              Shows App Store metrics in Fresh Works section
            </p>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {/* Google Analytics */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Google Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Measurement ID</label>
                <input
                  type="text"
                  value={settings.seo.googleAnalyticsId}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, googleAnalyticsId: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-text-muted text-xs mt-1">
                  Find this in Google Analytics → Admin → Data Streams → your stream
                </p>
              </div>
              <div className="flex items-end pb-6">
                <a
                  href="https://analytics.google.com/analytics/web/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2"
                >
                  Open Google Analytics <span className="text-xs">↗</span>
                </a>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <h4 className="text-amber-400 font-medium mb-2">Environment Variable Required</h4>
              <p className="text-text-muted text-sm mb-2">
                To enable tracking, add this to your <code className="bg-surface-muted px-1 rounded">.env.local</code>:
              </p>
              <code className="text-xs text-amber-300 block bg-surface-muted p-2 rounded">
                NEXT_PUBLIC_GA_MEASUREMENT_ID={settings.seo.googleAnalyticsId || 'G-XXXXXXXXXX'}
              </code>
            </div>
          </div>

          {/* Meta Tags */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-2xl">🔍</span> Default Meta Tags
            </h2>
            <p className="text-text-muted text-sm mb-4">
              These values are for documentation. To apply them, update <code className="bg-surface-muted px-1 rounded">src/app/layout.tsx</code>
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Default Title</label>
                <input
                  type="text"
                  value={settings.seo.defaultTitle}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, defaultTitle: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="Mad Masters - Web Development Studio"
                />
                <p className="text-text-muted text-xs mt-1">
                  Shows in browser tab and search results
                </p>
              </div>
              <div>
                <label className={labelClass}>Default Description</label>
                <textarea
                  value={settings.seo.defaultDescription}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, defaultDescription: e.target.value }
                  }))}
                  className={`${inputClass} h-24`}
                  placeholder="Meta description for SEO..."
                />
                <p className="text-text-muted text-xs mt-1">
                  Shows in search results below the title (max ~160 characters)
                </p>
              </div>
            </div>
          </div>

          {/* Social Sharing */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Social Sharing (Open Graph)
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Controls how your site looks when shared on Facebook, LinkedIn, Twitter, etc.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>OG Image Path</label>
                <input
                  type="text"
                  value={settings.seo.ogImage}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, ogImage: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="/og-image.png"
                />
                <p className="text-text-muted text-xs mt-1">
                  Image shown when sharing (recommended: 1200×630px)
                </p>
              </div>
              <div>
                <label className={labelClass}>Twitter/X Handle</label>
                <input
                  type="text"
                  value={settings.seo.twitterHandle}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, twitterHandle: e.target.value }
                  }))}
                  className={inputClass}
                  placeholder="@madmasters"
                />
                <p className="text-text-muted text-xs mt-1">
                  Your Twitter/X username for card attribution
                </p>
              </div>
            </div>

            {/* Preview card */}
            <div className="mt-6 p-4 bg-surface-muted rounded-lg border border-border">
              <h4 className="text-text-muted text-xs uppercase mb-3">Social Share Preview</h4>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-md">
                <div className="h-32 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-text-muted text-sm">
                  {settings.seo.ogImage || '/og-image.png'}
                </div>
                <div className="p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">madmasters.pro</p>
                  <p className="text-gray-900 dark:text-white font-medium text-sm mt-1">
                    {settings.seo.defaultTitle || 'Mad Masters - Web Development Studio'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                    {settings.seo.defaultDescription || 'Your meta description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {settings.updatedAt && (
        <div className="mt-6 text-text-muted text-sm text-right">
          Last updated: {new Date(settings.updatedAt).toLocaleString()} by {settings.updatedBy}
        </div>
      )}
    </div>
  );
}
