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
  updatedBy?: string;
}

interface SiteMapPage {
  id: string;
  label: string;
  path: string;
  icon: JSX.Element;
  disabled?: boolean;
  sections?: string[];
}

// Default content - MUST MATCH actual page content
const defaultContent: Omit<ContentBlock, 'id' | 'updatedAt'>[] = [
  // ==================== HOMEPAGE ====================
  { page: 'home', section: 'hero', key: 'badge', type: 'text', locales: { en: { value: 'Who We Are' }, fr: { value: 'Qui sommes-nous' } } },
  { page: 'home', section: 'hero', key: 'title', type: 'text', locales: { en: { value: 'WEB STUDIO' }, fr: { value: 'STUDIO WEB' } } },
  { page: 'home', section: 'hero', key: 'subtitle', type: 'text', locales: { en: { value: 'Every project meets W3C and Google Developers standards' }, fr: { value: 'Chaque projet répond aux normes W3C et Google Developers' } } },

  { page: 'home', section: 'stats', key: 'projects_value', type: 'text', locales: { en: { value: '150+' } } },
  { page: 'home', section: 'stats', key: 'projects_label', type: 'text', locales: { en: { value: 'Projects Completed' }, fr: { value: 'Projets Réalisés' } } },
  { page: 'home', section: 'stats', key: 'experience_value', type: 'text', locales: { en: { value: '8+' } } },
  { page: 'home', section: 'stats', key: 'experience_label', type: 'text', locales: { en: { value: 'Years Experience' }, fr: { value: 'Années d\'Expérience' } } },
  { page: 'home', section: 'stats', key: 'clients_value', type: 'text', locales: { en: { value: '50+' } } },
  { page: 'home', section: 'stats', key: 'clients_label', type: 'text', locales: { en: { value: 'Happy Clients' }, fr: { value: 'Clients Satisfaits' } } },
  { page: 'home', section: 'stats', key: 'success_value', type: 'text', locales: { en: { value: '99%' } } },
  { page: 'home', section: 'stats', key: 'success_label', type: 'text', locales: { en: { value: 'Success Rate' }, fr: { value: 'Taux de Réussite' } } },

  { page: 'home', section: 'about', key: 'card1_title', type: 'text', locales: { en: { value: 'Modern Technology' }, fr: { value: 'Technologie Moderne' } } },
  { page: 'home', section: 'about', key: 'card1_description', type: 'richtext', locales: { en: { value: 'We choose the most effective solutions for creating and operating your virtual office. We define stylish and modern design with special attention to page speed and usability.' }, fr: { value: 'Nous choisissons les solutions les plus efficaces pour créer et exploiter votre bureau virtuel.' } } },
  { page: 'home', section: 'about', key: 'card2_title', type: 'text', locales: { en: { value: 'SEO & Marketing' }, fr: { value: 'SEO & Marketing' } } },
  { page: 'home', section: 'about', key: 'card2_description', type: 'richtext', locales: { en: { value: 'Search engine optimization and website promotion is one of the most effective ways to attract customers and increase visibility to your target audience.' }, fr: { value: 'L\'optimisation des moteurs de recherche et la promotion de sites Web est l\'un des moyens les plus efficaces d\'attirer des clients.' } } },

  { page: 'home', section: 'services', key: 'badge', type: 'text', locales: { en: { value: 'WHAT WE DO' }, fr: { value: 'CE QUE NOUS FAISONS' } } },
  { page: 'home', section: 'services', key: 'title', type: 'text', locales: { en: { value: 'Our Services' }, fr: { value: 'Nos Services' } } },

  { page: 'home', section: 'contact', key: 'title', type: 'text', locales: { en: { value: 'Get In Touch' }, fr: { value: 'Contactez-nous' } } },
  { page: 'home', section: 'contact', key: 'subtitle', type: 'text', locales: { en: { value: "Ready to start your project? Let's talk." }, fr: { value: 'Prêt à démarrer votre projet ? Parlons-en.' } } },

  { page: 'home', section: 'footer', key: 'tagline', type: 'richtext', locales: { en: { value: "Creative team that embodies the client's ideas with the help of code and coffee in a worthy representation on the Internet" }, fr: { value: "Équipe créative qui incarne les idées du client à l'aide de code et de café" } } },
  { page: 'home', section: 'footer', key: 'company_name', type: 'text', locales: { en: { value: 'Mad Masters' } } },

  // ==================== ABOUT PAGE ====================
  { page: 'about', section: 'header', key: 'title', type: 'text', locales: { en: { value: 'About Mad Masters' }, fr: { value: 'À propos de Mad Masters' } } },
  { page: 'about', section: 'header', key: 'subtitle', type: 'text', locales: { en: { value: 'Web Studio' }, fr: { value: 'Studio Web' } } },
  { page: 'about', section: 'content', key: 'who_title', type: 'text', locales: { en: { value: 'Who We Are' }, fr: { value: 'Qui sommes-nous' } } },
  { page: 'about', section: 'content', key: 'who_paragraph1', type: 'richtext', locales: { en: { value: 'Mad Masters is a client-oriented team of professionals. Using modern technologies, responsibility, precise execution of tasks, maximum efficiency and thoughtful Design - this is about Mad Masters.' }, fr: { value: 'Mad Masters est une équipe de professionnels orientés client.' } } },
  { page: 'about', section: 'content', key: 'who_paragraph2', type: 'richtext', locales: { en: { value: 'We masterfully embody your ideas and wishes, as we put all our experience and knowledge into each project. Our employees are a team with solid experience in web technologies.' }, fr: { value: 'Nous incarnons magistralement vos idées et vos souhaits.' } } },
  { page: 'about', section: 'content', key: 'who_paragraph3', type: 'richtext', locales: { en: { value: 'Mad Masters works in such areas of web technologies as website creation and support, Internet marketing, custom development, layout and much more.' }, fr: { value: 'Mad Masters travaille dans des domaines tels que la création et le support de sites Web, le marketing Internet.' } } },
  { page: 'about', section: 'values', key: 'title', type: 'text', locales: { en: { value: 'Our Values' }, fr: { value: 'Nos Valeurs' } } },
  { page: 'about', section: 'values', key: 'quality_title', type: 'text', locales: { en: { value: 'Quality First' }, fr: { value: 'La Qualité d\'Abord' } } },
  { page: 'about', section: 'values', key: 'quality_description', type: 'text', locales: { en: { value: 'Every project meets W3C and Google standards' }, fr: { value: 'Chaque projet répond aux normes W3C et Google' } } },
  { page: 'about', section: 'values', key: 'speed_title', type: 'text', locales: { en: { value: 'Speed & Performance' }, fr: { value: 'Vitesse et Performance' } } },
  { page: 'about', section: 'values', key: 'speed_description', type: 'text', locales: { en: { value: 'Optimized for Google PageSpeed and Core Web Vitals' }, fr: { value: 'Optimisé pour Google PageSpeed et Core Web Vitals' } } },
  { page: 'about', section: 'values', key: 'client_title', type: 'text', locales: { en: { value: 'Client-Oriented' }, fr: { value: 'Orienté Client' } } },
  { page: 'about', section: 'values', key: 'client_description', type: 'text', locales: { en: { value: 'Your success is our priority' }, fr: { value: 'Votre succès est notre priorité' } } },
  { page: 'about', section: 'values', key: 'innovation_title', type: 'text', locales: { en: { value: 'Innovation' }, fr: { value: 'Innovation' } } },
  { page: 'about', section: 'values', key: 'innovation_description', type: 'text', locales: { en: { value: 'Modern technologies and creative solutions' }, fr: { value: 'Technologies modernes et solutions créatives' } } },

  // ==================== SERVICES PAGE ====================
  { page: 'services', section: 'header', key: 'title', type: 'text', locales: { en: { value: 'Our Services' }, fr: { value: 'Nos Services' } } },
  { page: 'services', section: 'header', key: 'subtitle', type: 'text', locales: { en: { value: 'What we can do for you' }, fr: { value: 'Ce que nous pouvons faire pour vous' } } },
  { page: 'services', section: 'web', key: 'title', type: 'text', locales: { en: { value: 'Web Development' }, fr: { value: 'Développement Web' } } },
  { page: 'services', section: 'web', key: 'description', type: 'richtext', locales: { en: { value: 'Professional website creation with modern technologies, responsive design, and optimal performance.' }, fr: { value: 'Création de sites Web professionnels avec des technologies modernes.' } } },
  { page: 'services', section: 'marketing', key: 'title', type: 'text', locales: { en: { value: 'Online Marketing' }, fr: { value: 'Marketing en Ligne' } } },
  { page: 'services', section: 'marketing', key: 'description', type: 'richtext', locales: { en: { value: 'Comprehensive digital marketing strategies to increase your online visibility and attract customers.' }, fr: { value: 'Stratégies de marketing numérique pour augmenter votre visibilité.' } } },
  { page: 'services', section: 'custom', key: 'title', type: 'text', locales: { en: { value: 'Custom Development' }, fr: { value: 'Développement Sur Mesure' } } },
  { page: 'services', section: 'custom', key: 'description', type: 'richtext', locales: { en: { value: 'Tailored software solutions designed specifically for your business needs and workflows.' }, fr: { value: 'Solutions logicielles sur mesure conçues spécifiquement pour votre entreprise.' } } },
  { page: 'services', section: 'support', key: 'title', type: 'text', locales: { en: { value: 'Support & Maintenance' }, fr: { value: 'Support et Maintenance' } } },
  { page: 'services', section: 'support', key: 'description', type: 'richtext', locales: { en: { value: 'Ongoing technical support and maintenance to keep your digital presence running smoothly.' }, fr: { value: 'Support technique et maintenance pour maintenir votre présence numérique.' } } },

  // ==================== WORK PAGE ====================
  { page: 'work', section: 'header', key: 'title', type: 'text', locales: { en: { value: 'Portfolio' }, fr: { value: 'Portfolio' } } },
  { page: 'work', section: 'header', key: 'subtitle', type: 'text', locales: { en: { value: 'Our completed projects' }, fr: { value: 'Nos projets réalisés' } } },
  { page: 'work', section: 'stats', key: 'clients_value', type: 'text', locales: { en: { value: '50+' } } },
  { page: 'work', section: 'stats', key: 'clients_label', type: 'text', locales: { en: { value: 'Happy Clients' }, fr: { value: 'Clients Satisfaits' } } },
  { page: 'work', section: 'stats', key: 'years_value', type: 'text', locales: { en: { value: '10+' } } },
  { page: 'work', section: 'stats', key: 'years_label', type: 'text', locales: { en: { value: 'Years Experience' }, fr: { value: 'Années d\'Expérience' } } },
  { page: 'work', section: 'stats', key: 'satisfaction_value', type: 'text', locales: { en: { value: '100%' } } },
  { page: 'work', section: 'stats', key: 'satisfaction_label', type: 'text', locales: { en: { value: 'Client Satisfaction' }, fr: { value: 'Satisfaction Client' } } },

  // ==================== CONTACT PAGE ====================
  { page: 'contact', section: 'header', key: 'title', type: 'text', locales: { en: { value: 'Contact Us' }, fr: { value: 'Contactez-nous' } } },
  { page: 'contact', section: 'header', key: 'subtitle', type: 'text', locales: { en: { value: 'Get in touch' }, fr: { value: 'Prenez contact' } } },
  { page: 'contact', section: 'info', key: 'email', type: 'text', locales: { en: { value: 'madmweb@gmail.com' } } },
  { page: 'contact', section: 'info', key: 'hours_weekday', type: 'text', locales: { en: { value: 'Mon-Thu: 09:00-19:00' }, fr: { value: 'Lun-Jeu: 09:00-19:00' } } },
  { page: 'contact', section: 'info', key: 'hours_friday', type: 'text', locales: { en: { value: 'Fri: 09:00-18:00' }, fr: { value: 'Ven: 09:00-18:00' } } },
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

// Sitemap tree configuration
const siteMap: SiteMapPage[] = [
  { id: 'home', label: 'Home', path: '/', icon: <HomeIcon />, sections: ['hero', 'stats', 'about', 'services', 'contact', 'footer'] },
  { id: 'about', label: 'About', path: '/about', icon: <InfoIcon /> },
  { id: 'services', label: 'Services', path: '/services', icon: <ServicesIcon /> },
  { id: 'work', label: 'Work', path: '/work', icon: <WorkIcon /> },
  { id: 'contact', label: 'Contact', path: '/contact', icon: <ContactIcon /> },
  { id: 'portfolio', label: 'Portfolio Items', path: '/work/*', icon: <LockIcon />, disabled: true },
  { id: 'brief', label: 'Brief', path: '/brief', icon: <LockIcon />, disabled: true },
  { id: 'calculator', label: 'Calculator', path: '/calculator', icon: <LockIcon />, disabled: true },
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
  const [lastUpdated, setLastUpdated] = useState<{ date: string; by: string } | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();

      if (res.ok && data.content && data.content.length > 0) {
        const fetchedIds = new Set(data.content.map((c: ContentBlock) => c.id));
        const missingDefaults = defaultContent
          .filter((item) => !fetchedIds.has(`${item.page}_${item.section}_${item.key}`))
          .map((item) => ({
            ...item,
            id: `${item.page}_${item.section}_${item.key}`,
            updatedAt: null,
          }));
        setContent([...data.content, ...missingDefaults]);

        // Find most recent update
        const sorted = [...data.content].sort((a: ContentBlock, b: ContentBlock) => {
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        if (sorted[0]?.updatedAt) {
          setLastUpdated({ date: sorted[0].updatedAt, by: sorted[0].updatedBy || 'Unknown' });
        }
      } else {
        const initialContent = defaultContent.map((item) => ({
          ...item,
          id: `${item.page}_${item.section}_${item.key}`,
          updatedAt: null,
        }));
        setContent(initialContent);
      }
    } catch (err) {
      console.error(err);
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

  const updateContent = (id: string, value: string) => {
    setContent((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            locales: {
              ...item.locales,
              [activeLocale]: { ...item.locales[activeLocale], value },
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
      const items = content.map(({ id, updatedAt, updatedBy, ...rest }) => rest);

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

  const formatSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      header: 'Page Header',
      content: 'Main Content',
      values: 'Our Values',
      info: 'Contact Information',
      stats: 'Statistics',
      web: 'Web Development',
      marketing: 'Marketing',
      custom: 'Custom Development',
      support: 'Support',
    };
    return titles[section] || section.charAt(0).toUpperCase() + section.slice(1);
  };

  // Determine grid layout based on content count in section
  const getGridClass = (items: ContentBlock[]) => {
    // Stats and values often look better in 2 columns
    const hasShortItems = items.every(item => item.type === 'text' && (item.locales.en.value?.length || 0) < 50);
    if (hasShortItems && items.length >= 4) {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    }
    return 'space-y-4';
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
                  if (page.sections) setActiveSection(page.sections[0]);
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
              {page.disabled && <span className="ml-auto text-xs opacity-60">Locked</span>}
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
            {hasChanges && <span className="text-yellow-400 text-sm">Unsaved changes</span>}
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
          <div className={`px-4 py-3 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
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
              activeLocale === 'en' ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:text-foreground'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setActiveLocale('fr')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeLocale === 'fr' ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:text-foreground'
            }`}
          >
            French
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-text-muted">Loading...</div>
          ) : filteredContent.length === 0 ? (
            <div className="text-text-muted text-center py-12">
              <p>No content blocks for this page yet.</p>
            </div>
          ) : activePage === 'home' ? (
            // Homepage with simple form for selected section
            <div className={getGridClass(filteredContent)}>
              {filteredContent.map((item) => (
                <FormField
                  key={item.id}
                  item={item}
                  activeLocale={activeLocale}
                  formatKey={formatKey}
                  updateContent={updateContent}
                />
              ))}
            </div>
          ) : (
            // Other pages grouped by section
            Object.entries(groupContentBySection(filteredContent)).map(([section, items]) => (
              <div key={section} className="mb-8">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
                  {formatSectionTitle(section)}
                </h3>
                <div className={getGridClass(items)}>
                  {items.map((item) => (
                    <FormField
                      key={item.id}
                      item={item}
                      activeLocale={activeLocale}
                      formatKey={formatKey}
                      updateContent={updateContent}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="mt-8 pt-4 border-t border-border text-right text-text-muted text-sm">
              Last updated: {new Date(lastUpdated.date).toLocaleString()} by {lastUpdated.by}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Field Component - Clean input style
function FormField({
  item,
  activeLocale,
  formatKey,
  updateContent,
}: {
  item: ContentBlock;
  activeLocale: 'en' | 'fr';
  formatKey: (key: string) => string;
  updateContent: (id: string, value: string) => void;
}) {
  const displayValue = item.locales[activeLocale]?.value || item.locales.en.value || '';

  return (
    <div>
      <label className="block text-text-muted text-sm mb-2">
        {formatKey(item.key)}
      </label>
      {item.type === 'richtext' ? (
        <textarea
          value={displayValue}
          onChange={(e) => updateContent(item.id, e.target.value)}
          className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-foreground focus:border-accent focus:outline-none min-h-[120px] resize-y"
          placeholder={`Enter ${formatKey(item.key)}`}
        />
      ) : (
        <input
          type="text"
          value={displayValue}
          onChange={(e) => updateContent(item.id, e.target.value)}
          className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-foreground focus:border-accent focus:outline-none"
          placeholder={`Enter ${formatKey(item.key)}`}
        />
      )}
    </div>
  );
}
