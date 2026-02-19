'use client';

import { useEffect, useState } from 'react';

interface ContentBlock {
  id: string;
  section: string;
  key: string;
  type: 'text' | 'richtext' | 'image' | 'link';
  locales: {
    en: { value: string; alt?: string };
    fr?: { value: string; alt?: string };
  };
  updatedAt: string | null;
}

// Default content structure
const defaultContent: Omit<ContentBlock, 'id' | 'updatedAt'>[] = [
  // Hero section
  { section: 'hero', key: 'title', type: 'text', locales: { en: { value: 'We Build Digital Experiences' } } },
  { section: 'hero', key: 'subtitle', type: 'text', locales: { en: { value: 'Transform your ideas into powerful digital products that drive results.' } } },
  { section: 'hero', key: 'cta_primary', type: 'text', locales: { en: { value: 'Start Your Project' } } },
  { section: 'hero', key: 'cta_secondary', type: 'text', locales: { en: { value: 'View Our Work' } } },

  // About section
  { section: 'about', key: 'title', type: 'text', locales: { en: { value: 'About Mad Masters' } } },
  { section: 'about', key: 'description', type: 'richtext', locales: { en: { value: 'We are a team of passionate developers, designers, and strategists dedicated to building exceptional digital products.' } } },
  { section: 'about', key: 'years_experience', type: 'text', locales: { en: { value: '10+' } } },
  { section: 'about', key: 'projects_completed', type: 'text', locales: { en: { value: '150+' } } },
  { section: 'about', key: 'happy_clients', type: 'text', locales: { en: { value: '50+' } } },

  // Services section
  { section: 'services', key: 'title', type: 'text', locales: { en: { value: 'Our Services' } } },
  { section: 'services', key: 'subtitle', type: 'text', locales: { en: { value: 'Comprehensive digital solutions for modern businesses' } } },

  // Contact section
  { section: 'contact', key: 'title', type: 'text', locales: { en: { value: 'Get In Touch' } } },
  { section: 'contact', key: 'subtitle', type: 'text', locales: { en: { value: 'Ready to start your project? Let\'s talk.' } } },
  { section: 'contact', key: 'email', type: 'text', locales: { en: { value: 'hello@madmasters.pro' } } },
  { section: 'contact', key: 'phone', type: 'text', locales: { en: { value: '+380 96 477 7690' } } },

  // Footer
  { section: 'footer', key: 'copyright', type: 'text', locales: { en: { value: '© 2024 Mad Masters. All rights reserved.' } } },
  { section: 'footer', key: 'tagline', type: 'text', locales: { en: { value: 'Building the future, one pixel at a time.' } } },
];

export default function ContentPage() {
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeLocale, setActiveLocale] = useState<'en' | 'fr'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sections = ['hero', 'about', 'services', 'contact', 'footer'];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();

      if (res.ok && data.content.length > 0) {
        setContent(data.content);
      } else {
        // Initialize with default content
        const initialContent = defaultContent.map((item, index) => ({
          ...item,
          id: `${item.section}_${item.key}`,
          updatedAt: null,
        }));
        setContent(initialContent);
      }
    } catch (err) {
      console.error(err);
      // Use defaults on error
      const initialContent = defaultContent.map((item) => ({
        ...item,
        id: `${item.section}_${item.key}`,
        updatedAt: null,
      }));
      setContent(initialContent);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = (id: string, locale: 'en' | 'fr', value: string) => {
    setContent((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            locales: {
              ...item.locales,
              [locale]: { ...item.locales[locale], value },
            },
          };
        }
        return item;
      })
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const items = content.map(({ id, updatedAt, ...rest }) => rest);

      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Content saved successfully!' });
        setHasChanges(false);
        fetchContent();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save content. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredContent = content.filter((item) => item.section === activeSection);

  const formatKey = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-white/60 mt-1">Edit website text and content</p>
        </div>
        <div className="flex items-center gap-4">
          {hasChanges && (
            <span className="text-yellow-400 text-sm">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              activeSection === section
                ? 'bg-accent text-white'
                : 'bg-surface text-white/70 hover:bg-surface-hover'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Locale Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveLocale('en')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            activeLocale === 'en'
              ? 'bg-white/20 text-white'
              : 'bg-surface text-white/50 hover:text-white'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setActiveLocale('fr')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            activeLocale === 'fr'
              ? 'bg-white/20 text-white'
              : 'bg-surface text-white/50 hover:text-white'
          }`}
        >
          French
        </button>
      </div>

      {/* Content Editor */}
      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <div key={item.id} className="bg-surface rounded-lg p-4 border border-white/10">
              <label className="block text-white/60 text-sm mb-2">
                {formatKey(item.key)}
                <span className="ml-2 text-white/30 text-xs">({item.type})</span>
              </label>

              {item.type === 'richtext' ? (
                <textarea
                  value={item.locales[activeLocale]?.value || item.locales.en.value}
                  onChange={(e) => updateContent(item.id, activeLocale, e.target.value)}
                  className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none min-h-[120px] resize-y"
                  placeholder={`Enter ${formatKey(item.key)} in ${activeLocale === 'en' ? 'English' : 'French'}`}
                />
              ) : item.type === 'image' ? (
                <div className="flex gap-4 items-start">
                  <input
                    type="url"
                    value={item.locales[activeLocale]?.value || item.locales.en.value}
                    onChange={(e) => updateContent(item.id, activeLocale, e.target.value)}
                    className="flex-1 bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                    placeholder="Image URL"
                  />
                  {(item.locales[activeLocale]?.value || item.locales.en.value) && (
                    <img
                      src={item.locales[activeLocale]?.value || item.locales.en.value}
                      alt={item.locales[activeLocale]?.alt || ''}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={item.locales[activeLocale]?.value || item.locales.en.value}
                  onChange={(e) => updateContent(item.id, activeLocale, e.target.value)}
                  className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                  placeholder={`Enter ${formatKey(item.key)} in ${activeLocale === 'en' ? 'English' : 'French'}`}
                />
              )}

              {item.updatedAt && (
                <p className="text-white/30 text-xs mt-2">
                  Last updated: {new Date(item.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-blue-400 font-medium mb-2">How to use Content Management</h3>
        <ul className="text-blue-300/70 text-sm space-y-1">
          <li>• Select a section tab to view and edit its content</li>
          <li>• Toggle between English and French to edit translations</li>
          <li>• Click "Save Changes" to publish your updates</li>
          <li>• Changes will be reflected on the live website immediately</li>
        </ul>
      </div>
    </div>
  );
}
