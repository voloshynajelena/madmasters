'use client';

import { useEffect, useState } from 'react';

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
  order: number;
  pinned: boolean;
  hidden: boolean;
}

const defaultItem: Omit<FreshWorkItem, 'id'> = {
  source: 'web',
  title: '',
  description: '',
  url: '',
  thumbnail: '',
  platform: 'Web',
  tags: [],
  metrics: {},
  order: 0,
  pinned: false,
  hidden: false,
};

export default function FreshWorksAdminPage() {
  const [items, setItems] = useState<FreshWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FreshWorkItem | null>(null);
  const [formData, setFormData] = useState(defaultItem);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/fresh');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData(defaultItem);
    setShowForm(false);
    setEditingItem(null);
    setError(null);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingItem
        ? `/api/admin/fresh/${editingItem.id}`
        : '/api/admin/fresh';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      resetForm();
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: FreshWorkItem) => {
    setEditingItem(item);
    setFormData({
      source: item.source,
      title: item.title,
      description: item.description,
      url: item.url,
      thumbnail: item.thumbnail || '',
      platform: item.platform || 'Web',
      tags: item.tags || [],
      metrics: item.metrics || {},
      order: item.order,
      pinned: item.pinned,
      hidden: item.hidden,
    });
    setShowForm(true);
  };

  const handleDelete = async (item: FreshWorkItem) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/fresh/${item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleField = async (item: FreshWorkItem, field: 'pinned' | 'hidden') => {
    try {
      const res = await fetch(`/api/admin/fresh/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !item[field] }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, [field]: !i[field] } : i))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()],
    }));
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSeed = async () => {
    if (!confirm('Add Litrlly, Litrlly Kids, and Librora to Fresh Works?')) return;

    setSeeding(true);
    try {
      const res = await fetch('/api/admin/fresh/seed', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to seed');
    } finally {
      setSeeding(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Update existing items to Web source type?')) return;

    setMigrating(true);
    try {
      const res = await fetch('/api/admin/fresh/seed', { method: 'PUT' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to migrate');
    } finally {
      setMigrating(false);
    }
  };

  const sourceColors: Record<string, string> = {
    web: 'bg-blue-600',
    custom: 'bg-accent',
    soft: 'bg-purple-600',
  };

  const sourceLabels: Record<string, string> = {
    web: 'Web',
    custom: 'Apps',
    soft: 'Soft',
  };

  const displayedItems = items.filter((item) => !item.hidden);
  const hiddenItems = items.filter((item) => item.hidden);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Fresh Works</h1>
          <p className="text-white/60 mt-1">Showcase your latest apps and projects</p>
        </div>
        <div className="flex gap-3">
          {items.length > 0 && !loading && (
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {migrating ? 'Fixing...' : 'Fix to Web'}
            </button>
          )}
          {items.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {seeding ? 'Adding...' : 'Add Litrlly Apps'}
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 mb-8 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
                placeholder="Litrlly"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required
                placeholder="https://litrlly.app"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[80px] resize-y"
                placeholder="AI-powered reading companion for book lovers"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData((p) => ({ ...p, thumbnail: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                placeholder="/content/img/fresh/litrlly.png"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              >
                <option value="Web">Web App</option>
                <option value="iOS">iOS App</option>
                <option value="Android">Android App</option>
                <option value="Desktop">Desktop App</option>
                <option value="Mobile">Mobile App</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Source Type</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value as 'web' | 'custom' | 'soft' }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              >
                <option value="web">Web</option>
                <option value="custom">Apps</option>
                <option value="soft">Soft</option>
              </select>
            </div>
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
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-accent/20 text-accent rounded text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(i)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData((p) => ({ ...p, pinned: e.target.checked }))}
                className="w-4 h-4 rounded border-white/20 bg-surface-muted accent-accent"
              />
              Pinned (show at top)
            </label>
            <label className="flex items-center gap-2 text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hidden}
                onChange={(e) => setFormData((p) => ({ ...p, hidden: e.target.checked }))}
                className="w-4 h-4 rounded border-white/20 bg-surface-muted accent-accent"
              />
              Hidden
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      )}

      {/* Items List */}
      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-white/10">
          <p className="text-white/60 mb-4">No fresh works yet</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="text-blue-400 hover:underline disabled:opacity-50"
            >
              {seeding ? 'Adding...' : 'Add Litrlly, Kids & Librora'}
            </button>
            <span className="text-white/30">or</span>
            <button
              onClick={() => setShowForm(true)}
              className="text-accent hover:underline"
            >
              Add custom item
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Items */}
          <h2 className="text-lg font-semibold text-white mb-4">Active ({displayedItems.length})</h2>
          <div className="space-y-2 mb-8">
            {displayedItems.map((item) => (
              <div key={item.id} className="bg-surface rounded-lg p-4 flex items-center gap-4 border border-white/10">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold ${sourceColors[item.source]}`}>
                    {sourceLabels[item.source].slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.pinned && (
                      <span className="text-yellow-400 text-xs">📌</span>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:text-accent truncate"
                    >
                      {item.title}
                    </a>
                    <span className={`px-2 py-0.5 rounded text-xs ${sourceColors[item.source]} text-white`}>
                      {item.platform || sourceLabels[item.source]}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm truncate">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleField(item, 'pinned')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      item.pinned
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {item.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 rounded text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleField(item, 'hidden')}
                    className="px-3 py-1 rounded text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                  >
                    Hide
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1 rounded text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Items */}
          {hiddenItems.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-white/60 mb-4">Hidden ({hiddenItems.length})</h2>
              <div className="space-y-2">
                {hiddenItems.map((item) => (
                  <div key={item.id} className="bg-surface/50 rounded-lg p-4 flex items-center gap-4 opacity-60 border border-white/5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold ${sourceColors[item.source]}`}>
                      {sourceLabels[item.source].slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 rounded text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleField(item, 'hidden')}
                        className="px-3 py-1 rounded text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Show
                      </button>
                    </div>
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
