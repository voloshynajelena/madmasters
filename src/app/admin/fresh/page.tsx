'use client';

import { useEffect, useState } from 'react';

interface FreshWorkItem {
  sourceId: string;
  source: 'github' | 'appstore';
  title: string;
  description: string;
  platform: string;
  lastActivity: string;
  url: string;
  metrics: {
    stars?: number;
    forks?: number;
    rating?: number;
    version?: string;
  };
  tags: string[];
}

interface Override {
  sourceId: string;
  pinned: boolean;
  hidden: boolean;
  summaryOverride?: string;
}

export default function FreshWorksAdminPage() {
  const [items, setItems] = useState<FreshWorkItem[]>([]);
  const [overrides, setOverrides] = useState<Map<string, Override>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch fresh works
        const res = await fetch('/api/fresh');
        const data = await res.json();
        setItems(data.items || []);

        // Fetch overrides
        const overridesRes = await fetch('/api/admin/fresh-overrides');
        if (overridesRes.ok) {
          const overridesData = await overridesRes.json();
          const map = new Map<string, Override>();
          overridesData.overrides?.forEach((o: Override) => {
            map.set(o.sourceId, o);
          });
          setOverrides(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleOverride = async (sourceId: string, field: 'pinned' | 'hidden') => {
    const current = overrides.get(sourceId) || { sourceId, pinned: false, hidden: false };
    const updated = { ...current, [field]: !current[field] };

    setSaving(sourceId);
    try {
      const res = await fetch('/api/admin/fresh-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setOverrides((prev) => new Map(prev).set(sourceId, updated));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const displayedItems = items.filter((item) => {
    const override = overrides.get(item.sourceId);
    return !override?.hidden;
  });

  const hiddenItems = items.filter((item) => {
    const override = overrides.get(item.sourceId);
    return override?.hidden;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Fresh Works</h1>
          <p className="text-white/60 mt-1">Manage GitHub & App Store display</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Configuration Notice */}
      <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg mb-6">
        <p className="font-medium">Configuration</p>
        <p className="text-sm mt-1 text-blue-300/80">
          Set <code className="bg-blue-500/30 px-1 rounded">GITHUB_ORG</code> and{' '}
          <code className="bg-blue-500/30 px-1 rounded">APPSTORE_APP_IDS</code> environment variables to fetch your projects.
        </p>
      </div>

      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <p className="text-white/60">No fresh works found</p>
          <p className="text-white/40 text-sm mt-2">
            Configure environment variables to show your projects.
          </p>
        </div>
      ) : (
        <>
          {/* Active Items */}
          <h2 className="text-lg font-semibold text-white mb-4">Active ({displayedItems.length})</h2>
          <div className="space-y-2 mb-8">
            {displayedItems.map((item) => {
              const override = overrides.get(item.sourceId);
              return (
                <div key={item.sourceId} className="bg-surface rounded-lg p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
                    item.source === 'github' ? 'bg-gray-700' : 'bg-blue-600'
                  }`}>
                    {item.source === 'github' ? 'GH' : 'AS'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {override?.pinned && (
                        <span className="text-yellow-400 text-xs">📌 Pinned</span>
                      )}
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-accent truncate">
                        {item.title}
                      </a>
                    </div>
                    <p className="text-white/50 text-sm truncate">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleOverride(item.sourceId, 'pinned')}
                      disabled={saving === item.sourceId}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        override?.pinned
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {override?.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => toggleOverride(item.sourceId, 'hidden')}
                      disabled={saving === item.sourceId}
                      className="px-3 py-1 rounded text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hidden Items */}
          {hiddenItems.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-white/60 mb-4">Hidden ({hiddenItems.length})</h2>
              <div className="space-y-2">
                {hiddenItems.map((item) => (
                  <div key={item.sourceId} className="bg-surface/50 rounded-lg p-4 flex items-center gap-4 opacity-60">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                      item.source === 'github' ? 'bg-gray-700' : 'bg-blue-600'
                    }`}>
                      {item.source === 'github' ? 'GH' : 'AS'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.title}</p>
                    </div>
                    <button
                      onClick={() => toggleOverride(item.sourceId, 'hidden')}
                      disabled={saving === item.sourceId}
                      className="px-3 py-1 rounded text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      Show
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
