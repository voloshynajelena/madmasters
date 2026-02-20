'use client';

import { useEffect, useState } from 'react';

interface ContentBlock {
  id: string;
  page: string;
  section: string;
  key: string;
  type: 'text' | 'richtext' | 'image' | 'link';
  locales: {
    en: { value: string; alt?: string };
    fr?: { value: string; alt?: string };
  };
  updatedAt: string | null;
}

interface SiteMapPage {
  id: string;
  label: string;
  path: string;
  icon: JSX.Element;
  disabled?: boolean;
  children?: SiteMapPage[];
  sections?: string[]; // For homepage tabs
}

// Default content structure organized by page
const defaultContent: Omit<ContentBlock, 'id' | 'updatedAt'>[] = [
  // Homepage - Hero section
  { page: 'home', section: 'hero', key: 'badge', type: 'text', locales: { en: { value: 'Who We Are' } } },
  { page: 'home', section: 'hero', key: 'title', type: 'text', locales: { en: { value: 'WEB STUDIO' } } },
  { page: 'home', section: 'hero', key: 'subtitle', type: 'text', locales: { en: { value: 'Every project meets W3C and Google Developers standards' } } },

  // Homepage - Stats section
  { page: 'home', section: 'stats', key: 'projects_value', type: 'text', locales: { en: { value: '150+' } } },
  { page: 'home', section: 'stats', key: 'projects_label', type: 'text', locales: { en: { value: 'Projects Completed' } } },
  { page: 'home', section: 'stats', key: 'experience_value', type: 'text', locales: { en: { value: '8+' } } },
  { page: 'home', section: 'stats', key: 'experience_label', type: 'text', locales: { en: { value: 'Years Experience' } } },
  { page: 'home', section: 'stats', key: 'clients_value', type: 'text', locales: { en: { value: '50+' } } },
  { page: 'home', section: 'stats', key: 'clients_label', type: 'text', locales: { en: { value: 'Happy Clients' } } },
  { page: 'home', section: 'stats', key: 'success_value', type: 'text', locales: { en: { value: '99%' } } },
  { page: 'home', section: 'stats', key: 'success_label', type: 'text', locales: { en: { value: 'Success Rate' } } },

  // Homepage - About section
  { page: 'home', section: 'about', key: 'card1_title', type: 'text', locales: { en: { value: 'Modern Technology' } } },
  { page: 'home', section: 'about', key: 'card1_description', type: 'richtext', locales: { en: { value: 'We choose the most effective solutions for creating and operating your virtual office. We define stylish and modern design with special attention to page speed and usability.' } } },
  { page: 'home', section: 'about', key: 'card2_title', type: 'text', locales: { en: { value: 'SEO & Marketing' } } },
  { page: 'home', section: 'about', key: 'card2_description', type: 'richtext', locales: { en: { value: 'Search engine optimization and website promotion is one of the most effective ways to attract customers and increase visibility to your target audience.' } } },

  // Homepage - Services section
  { page: 'home', section: 'services', key: 'title', type: 'text', locales: { en: { value: 'Our Services' } } },
  { page: 'home', section: 'services', key: 'web_title', type: 'text', locales: { en: { value: 'Web Development' } } },
  { page: 'home', section: 'services', key: 'web_description', type: 'richtext', locales: { en: { value: 'Custom websites and web applications built with modern technologies.' } } },
  { page: 'home', section: 'services', key: 'marketing_title', type: 'text', locales: { en: { value: 'Digital Marketing' } } },
  { page: 'home', section: 'services', key: 'marketing_description', type: 'text', locales: { en: { value: 'SEO, PPC, and social media marketing strategies.' } } },

  // Homepage - Contact section
  { page: 'home', section: 'contact', key: 'title', type: 'text', locales: { en: { value: 'Get In Touch' } } },
  { page: 'home', section: 'contact', key: 'subtitle', type: 'text', locales: { en: { value: "Ready to start your project? Let's talk." } } },

  // Homepage - Footer section
  { page: 'home', section: 'footer', key: 'tagline', type: 'text', locales: { en: { value: "Creative team that embodies the client's ideas with the help of code and coffee in a worthy representation on the Internet" } } },
  { page: 'home', section: 'footer', key: 'company_name', type: 'text', locales: { en: { value: 'Mad Masters' } } },

  // About page
  { page: 'about', section: 'main', key: 'title', type: 'text', locales: { en: { value: 'About Us' } } },
  { page: 'about', section: 'main', key: 'subtitle', type: 'text', locales: { en: { value: 'Learn more about our team' } } },
  { page: 'about', section: 'main', key: 'description', type: 'richtext', locales: { en: { value: 'We are a team of passionate developers, designers, and strategists dedicated to building exceptional digital products.' } } },
  { page: 'about', section: 'main', key: 'mission_title', type: 'text', locales: { en: { value: 'Our Mission' } } },
  { page: 'about', section: 'main', key: 'mission_description', type: 'richtext', locales: { en: { value: 'To deliver high-quality digital solutions that help businesses grow and succeed in the modern world.' } } },

  // Services page
  { page: 'services', section: 'main', key: 'title', type: 'text', locales: { en: { value: 'Our Services' } } },
  { page: 'services', section: 'main', key: 'subtitle', type: 'text', locales: { en: { value: 'Comprehensive digital solutions' } } },
  { page: 'services', section: 'web', key: 'title', type: 'text', locales: { en: { value: 'Web Development' } } },
  { page: 'services', section: 'web', key: 'description', type: 'richtext', locales: { en: { value: 'Custom websites and web applications tailored to your needs.' } } },
  { page: 'services', section: 'marketing', key: 'title', type: 'text', locales: { en: { value: 'Digital Marketing' } } },
  { page: 'services', section: 'marketing', key: 'description', type: 'richtext', locales: { en: { value: 'Comprehensive marketing strategies to grow your online presence.' } } },
  { page: 'services', section: 'design', key: 'title', type: 'text', locales: { en: { value: 'UI/UX Design' } } },
  { page: 'services', section: 'design', key: 'description', type: 'richtext', locales: { en: { value: 'Beautiful and intuitive designs that engage users.' } } },

  // Contact page
  { page: 'contact', section: 'main', key: 'title', type: 'text', locales: { en: { value: 'Contact Us' } } },
  { page: 'contact', section: 'main', key: 'subtitle', type: 'text', locales: { en: { value: 'Get in touch' } } },
  { page: 'contact', section: 'info', key: 'email', type: 'text', locales: { en: { value: 'madmweb@gmail.com' } } },
  { page: 'contact', section: 'info', key: 'phone', type: 'text', locales: { en: { value: '+380 96 477 7690' } } },
  { page: 'contact', section: 'info', key: 'hours_weekday', type: 'text', locales: { en: { value: 'Mon-Thu: 09:00-19:00' } } },
  { page: 'contact', section: 'info', key: 'hours_friday', type: 'text', locales: { en: { value: 'Fri: 09:00-18:00' } } },

  // Work page
  { page: 'work', section: 'main', key: 'title', type: 'text', locales: { en: { value: 'Our Work' } } },
  { page: 'work', section: 'main', key: 'subtitle', type: 'text', locales: { en: { value: 'Featured projects' } } },
];

// Icons
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const ServicesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const WorkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// Sitemap tree configuration
const siteMap: SiteMapPage[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: <HomeIcon />,
    sections: ['hero', 'stats', 'about', 'services', 'contact', 'footer'],
  },
  {
    id: 'about',
    label: 'About',
    path: '/about',
    icon: <InfoIcon />,
  },
  {
    id: 'services',
    label: 'Services',
    path: '/services',
    icon: <ServicesIcon />,
  },
  {
    id: 'work',
    label: 'Work',
    path: '/work',
    icon: <WorkIcon />,
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    icon: <ContactIcon />,
  },
  {
    id: 'portfolio',
    label: 'Portfolio Items',
    path: '/work/*',
    icon: <LockIcon />,
    disabled: true,
  },
  {
    id: 'brief',
    label: 'Brief',
    path: '/brief',
    icon: <LockIcon />,
    disabled: true,
  },
  {
    id: 'calculator',
    label: 'Calculator',
    path: '/calculator',
    icon: <LockIcon />,
    disabled: true,
  },
];

export default function ContentPage() {
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [activeSection, setActiveSection] = useState('hero');
  const [activeLocale, setActiveLocale] = useState<'en' | 'fr'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();

      if (res.ok && data.content && data.content.length > 0) {
        setContent(data.content);
      } else {
        // Initialize with default content
        const initialContent = defaultContent.map((item) => ({
          ...item,
          id: `${item.page}_${item.section}_${item.key}`,
          updatedAt: null,
        }));
        setContent(initialContent);
      }
    } catch (err) {
      console.error(err);
      // Use defaults on error
      const initialContent = defaultContent.map((item) => ({
        ...item,
        id: `${item.page}_${item.section}_${item.key}`,
        updatedAt: null,
      }));
      setContent(initialContent);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (item: ContentBlock) => {
    setEditingId(item.id);
    setEditValue(item.locales[activeLocale]?.value || item.locales.en.value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEditing = (id: string) => {
    setContent((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            locales: {
              ...item.locales,
              [activeLocale]: { ...item.locales[activeLocale], value: editValue },
            },
          };
        }
        return item;
      })
    );
    setHasChanges(true);
    setEditingId(null);
    setEditValue('');
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

  // Get content for current page
  const getPageContent = () => {
    if (activePage === 'home') {
      return content.filter((item) => item.page === 'home' && item.section === activeSection);
    }
    return content.filter((item) => item.page === activePage);
  };

  const filteredContent = getPageContent();
  const currentPageConfig = siteMap.find((p) => p.id === activePage);

  const formatKey = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const groupContentBySection = (items: ContentBlock[]) => {
    const groups: Record<string, ContentBlock[]> = {};
    items.forEach((item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Sitemap Tree - Left Panel */}
      <div className="w-64 flex-shrink-0 bg-surface rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Site Pages</h2>
          <p className="text-xs text-text-muted mt-1">Select a page to edit</p>
        </div>
        <div className="p-2 overflow-y-auto max-h-[calc(100%-80px)]">
          {siteMap.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                if (!page.disabled) {
                  setActivePage(page.id);
                  if (page.sections) {
                    setActiveSection(page.sections[0]);
                  }
                }
              }}
              disabled={page.disabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1 ${
                page.disabled
                  ? 'opacity-40 cursor-not-allowed text-text-muted'
                  : activePage === page.id
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              <span className={page.disabled ? 'opacity-50' : ''}>{page.icon}</span>
              <span className="text-sm font-medium">{page.label}</span>
              {page.disabled && (
                <span className="ml-auto text-xs opacity-60">Locked</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Editor - Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
            <p className="text-text-muted text-sm mt-1">
              Editing: <span className="text-accent">{currentPageConfig?.label}</span> ({currentPageConfig?.path})
            </p>
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
            className={`px-4 py-3 rounded-lg mb-4 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Section Tabs for Homepage */}
        {activePage === 'home' && currentPageConfig?.sections && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {currentPageConfig.sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  activeSection === section
                    ? 'bg-accent text-white'
                    : 'bg-surface text-text-muted hover:bg-surface-hover'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        )}

        {/* Locale Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveLocale('en')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeLocale === 'en'
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted hover:text-foreground'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setActiveLocale('fr')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeLocale === 'fr'
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted hover:text-foreground'
            }`}
          >
            French
          </button>
        </div>

        {/* Content Editor */}
        <div className="flex-1 overflow-y-auto bg-surface rounded-lg border border-border p-4">
          {loading ? (
            <div className="text-text-muted">Loading...</div>
          ) : filteredContent.length === 0 ? (
            <div className="text-text-muted text-center py-12">
              <p>No content blocks for this page yet.</p>
              <p className="text-sm mt-2">Content will be created when you save.</p>
            </div>
          ) : activePage === 'home' ? (
            // Homepage with flat list for selected section
            <div className="space-y-3">
              {filteredContent.map((item) => (
                <ContentBlockEditor
                  key={item.id}
                  item={item}
                  activeLocale={activeLocale}
                  editingId={editingId}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  startEditing={startEditing}
                  saveEditing={saveEditing}
                  cancelEditing={cancelEditing}
                  formatKey={formatKey}
                />
              ))}
            </div>
          ) : (
            // Other pages grouped by section
            Object.entries(groupContentBySection(filteredContent)).map(([section, items]) => (
              <div key={section} className="mb-6">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 capitalize">
                  {section === 'main' ? 'Page Content' : section}
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <ContentBlockEditor
                      key={item.id}
                      item={item}
                      activeLocale={activeLocale}
                      editingId={editingId}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      startEditing={startEditing}
                      saveEditing={saveEditing}
                      cancelEditing={cancelEditing}
                      formatKey={formatKey}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Content Block Editor Component
function ContentBlockEditor({
  item,
  activeLocale,
  editingId,
  editValue,
  setEditValue,
  startEditing,
  saveEditing,
  cancelEditing,
  formatKey,
}: {
  item: ContentBlock;
  activeLocale: 'en' | 'fr';
  editingId: string | null;
  editValue: string;
  setEditValue: (value: string) => void;
  startEditing: (item: ContentBlock) => void;
  saveEditing: (id: string) => void;
  cancelEditing: () => void;
  formatKey: (key: string) => string;
}) {
  const isEditing = editingId === item.id;
  const displayValue = item.locales[activeLocale]?.value || item.locales.en.value;

  return (
    <div className="group relative bg-surface-muted rounded-lg border border-border hover:border-accent/50 transition-colors">
      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
        <span className="text-text-muted text-xs">
          {formatKey(item.key)}
          <span className="ml-2 opacity-50">({item.type})</span>
        </span>
        {!isEditing && (
          <button
            onClick={() => startEditing(item)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-accent/20 text-text-muted hover:text-accent transition-all"
            title="Edit"
          >
            <PencilIcon />
          </button>
        )}
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            {item.type === 'richtext' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:border-accent focus:outline-none min-h-[100px] resize-y"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-accent focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditing(item.id);
                  if (e.key === 'Escape') cancelEditing();
                }}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEditing}
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-muted transition-colors"
                title="Cancel"
              >
                <XIcon />
              </button>
              <button
                onClick={() => saveEditing(item.id)}
                className="p-2 rounded-lg bg-accent hover:bg-accent/90 text-white transition-colors"
                title="Save"
              >
                <CheckIcon />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground whitespace-pre-wrap">
            {displayValue || <span className="text-text-muted italic">Empty</span>}
          </p>
        )}
      </div>

      {item.updatedAt && (
        <div className="px-4 pb-2 text-text-muted opacity-50 text-xs">
          Last updated: {new Date(item.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
