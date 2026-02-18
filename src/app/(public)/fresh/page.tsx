'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { getDictionary } from '@/i18n/dictionaries';

interface FreshWorkItem {
  sourceId: string;
  source: 'github' | 'appstore';
  title: string;
  description: string;
  platform: string;
  lastActivity: string;
  url: string;
  imageUrl?: string;
  metrics: {
    stars?: number;
    forks?: number;
    rating?: number;
    downloads?: number;
    version?: string;
  };
  tags: string[];
}

interface FreshWorksData {
  items: FreshWorkItem[];
  lastUpdated: string;
  error?: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}

export default function FreshPage() {
  const dict = getDictionary('en');
  const [data, setData] = useState<FreshWorksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'github' | 'appstore'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/fresh');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredItems = data?.items.filter(
    (item) => filter === 'all' || item.source === filter
  ) || [];

  return (
    <PageLayout locale="en" title="Fresh & Active Work" subtitle="Our latest projects and updates">
      <div className="py-16">
        <div className="container-section">
          {/* Filters */}
          <div className="flex gap-2 mb-8">
            {(['all', 'github', 'appstore'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  filter === f
                    ? 'bg-accent text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {f === 'all' ? 'All' : f === 'github' ? 'GitHub' : 'App Store'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-primary/60 mt-4">Loading fresh works...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-primary/5 rounded-lg">
              <p className="text-primary/60">No fresh works found</p>
              <p className="text-primary/40 text-sm mt-2">
                Configure GITHUB_ORG and APPSTORE_APP_IDS environment variables to show your projects.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <a
                  key={item.sourceId}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-lg border border-primary/10 overflow-hidden hover:border-accent hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.source === 'github' ? 'bg-gray-900' : 'bg-blue-500'
                        }`}>
                          {item.source === 'github' ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary truncate group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-primary/50 mt-1">
                          <span>{item.platform}</span>
                          <span>•</span>
                          <span>{formatDate(item.lastActivity)}</span>
                        </div>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-primary/60 text-sm mt-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Metrics */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-primary/50">
                      {item.metrics.stars !== undefined && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {item.metrics.stars}
                        </span>
                      )}
                      {item.metrics.forks !== undefined && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          {item.metrics.forks}
                        </span>
                      )}
                      {item.metrics.rating !== undefined && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {item.metrics.rating.toFixed(1)}
                        </span>
                      )}
                      {item.metrics.version && (
                        <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                          v{item.metrics.version}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {data?.lastUpdated && (
            <p className="text-center text-primary/40 text-sm mt-8">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
