'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/page-layout';

interface FreshWorkItem {
  id: string;
  source: 'web' | 'custom' | 'soft';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  platform?: string;
  tags: string[];
  metrics?: {
    stars?: number;
    forks?: number;
    rating?: number;
    version?: string;
    downloads?: string;
  };
  pinned: boolean;
}

interface FreshWorksData {
  items: FreshWorkItem[];
  lastUpdated: string;
  error?: string;
}

export default function FreshPage() {
  const [data, setData] = useState<FreshWorksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'web' | 'custom' | 'soft'>('all');

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

  const sourceLabels = {
    all: 'All',
    web: 'Web',
    custom: 'Apps',
    soft: 'Soft',
  };

  return (
    <PageLayout locale="en" title="Fresh & Active Work" subtitle="Our latest projects and updates">
      <div className="py-16">
        <div className="container-section">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(['all', 'web', 'custom', 'soft'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  filter === f
                    ? 'bg-accent text-white'
                    : 'bg-surface text-foreground/70 hover:bg-surface-hover'
                }`}
              >
                {sourceLabels[f]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-foreground/60 mt-4">Loading fresh works...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg">
              <p className="text-foreground/60">No fresh works found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-surface rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/5 hover:border-accent/30"
                >
                  {/* Thumbnail */}
                  {item.thumbnail && (
                    <div className="relative h-40 overflow-hidden bg-surface-muted">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.pinned && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {!item.thumbnail && (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.source === 'web'
                            ? 'bg-blue-600'
                            : item.source === 'soft'
                              ? 'bg-purple-600'
                              : 'bg-accent'
                        }`}>
                          {item.source === 'web' ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                          ) : item.source === 'soft' ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.pinned && !item.thumbnail && (
                            <span className="text-yellow-400 text-sm">📌</span>
                          )}
                          <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium ${
                            item.source === 'web'
                              ? 'bg-blue-600/20 text-blue-400'
                              : item.source === 'soft'
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'bg-accent/20 text-accent'
                          }`}>
                            {item.platform || item.source}
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-foreground/60 text-sm mt-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Metrics */}
                    {item.metrics && Object.keys(item.metrics).length > 0 && (
                      <div className="flex items-center gap-4 mt-4 text-sm text-foreground/50">
                        {item.metrics.stars !== undefined && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.metrics.stars}
                          </span>
                        )}
                        {item.metrics.rating !== undefined && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.metrics.rating}
                          </span>
                        )}
                        {item.metrics.downloads && (
                          <span className="text-xs">{item.metrics.downloads} downloads</span>
                        )}
                        {item.metrics.version && (
                          <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded">
                            v{item.metrics.version}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
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
            <p className="text-center text-foreground/40 text-sm mt-8">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
