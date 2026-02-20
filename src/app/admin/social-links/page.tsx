'use client';

import { useEffect, useState } from 'react';
import { allSocialNetworks, type SocialLink } from '@/data/social-links';

export default function SocialLinksAdmin() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/admin/social-links');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load');
      }

      // Merge with all available networks to show new ones
      const existingIds = new Set(data.links.map((l: SocialLink) => l.id));
      const mergedLinks = [...data.links];

      allSocialNetworks.forEach((network, index) => {
        if (!existingIds.has(network.id)) {
          mergedLinks.push({
            ...network,
            url: '',
            enabled: false,
            order: data.links.length + index + 1,
          });
        }
      });

      setLinks(mergedLinks.sort((a: SocialLink, b: SocialLink) => a.order - b.order));
    } catch (err) {
      console.error('Failed to fetch social links:', err);
      setMessage({ type: 'error', text: 'Failed to load social links' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, enabled: !link.enabled } : link
      )
    );
  };

  const handleUrlChange = (id: string, url: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, url } : link
      )
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    // Update order values
    newLinks.forEach((link, i) => {
      link.order = i + 1;
    });
    setLinks(newLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    // Update order values
    newLinks.forEach((link, i) => {
      link.order = i + 1;
    });
    setLinks(newLinks);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Social links saved successfully!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setMessage({ type: 'error', text: 'Failed to save social links' });
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = links.filter(l => l.enabled && l.url).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Links</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage social media links displayed in the footer ({enabledCount} active)
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
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {links.map((link, index) => (
              <div
                key={link.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                  link.enabled ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Reorder buttons */}
                <div className="flex sm:flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === links.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Icon & Name */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    link.enabled ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={link.icon} />
                    </svg>
                  </div>
                  <span className={`font-medium ${link.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                    {link.name}
                  </span>
                </div>

                {/* URL Input */}
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder={`https://${link.id}.com/yourprofile`}
                    value={link.url}
                    onChange={(e) => handleUrlChange(link.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                  />
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${link.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {link.enabled ? 'Visible' : 'Hidden'}
                  </span>
                  <button
                    onClick={() => handleToggle(link.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      link.enabled ? 'bg-accent' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        link.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2">Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>- Only links with URLs and enabled status will appear in the footer</li>
          <li>- Use arrows to reorder how links appear</li>
          <li>- Most relevant social networks for business are listed first</li>
        </ul>
      </div>
    </div>
  );
}
