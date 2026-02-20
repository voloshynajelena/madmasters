'use client';

import { useEffect, useState } from 'react';

interface ContentMap {
  [key: string]: string;
}

// Default content fallbacks
const defaultContent: ContentMap = {
  // Homepage - Hero section
  'hero.badge': 'Who We Are',
  'hero.title': 'WEB STUDIO',
  'hero.subtitle': 'Every project meets W3C and Google Developers standards',

  // Homepage - Stats section
  'stats.projects_value': '150+',
  'stats.projects_label': 'Projects Completed',
  'stats.experience_value': '8+',
  'stats.experience_label': 'Years Experience',
  'stats.clients_value': '50+',
  'stats.clients_label': 'Happy Clients',
  'stats.success_value': '99%',
  'stats.success_label': 'Success Rate',

  // Homepage - About section
  'about.card1_title': 'Modern Technology',
  'about.card1_description': 'We choose the most effective solutions for creating and operating your virtual office.',
  'about.card2_title': 'SEO & Marketing',
  'about.card2_description': 'Search engine optimization and website promotion to attract customers.',

  // Homepage - Services section
  'services.title': 'Our Services',
  'services.subtitle': 'Comprehensive digital solutions for modern businesses',

  // Homepage - Contact section
  'contact.title': 'Get In Touch',
  'contact.subtitle': "Ready to start your project? Let's talk.",

  // Homepage - Footer section
  'footer.tagline': "Creative team that embodies the client's ideas with the help of code and coffee in a worthy representation on the Internet",
  'footer.company_name': 'Mad Masters',

  // Contact page
  'info.email': 'madmweb@gmail.com',
  'info.phone': '+380 96 477 7690',
  'info.hours_weekday': 'Mon-Thu: 09:00-19:00',
  'info.hours_friday': 'Fri: 09:00-18:00',

  // Shorthand aliases for backward compatibility
  'contact.email': 'madmweb@gmail.com',
  'contact.phone': '+380 96 477 7690',
  'contact.hours_weekday': 'Mon-Thu: 09:00-19:00',
  'contact.hours_friday': 'Fri: 09:00-18:00',
};

interface UseContentOptions {
  page?: string;
  section?: string;
  locale?: string;
}

export function useContent(sectionOrOptions?: string | UseContentOptions, localeArg: string = 'en') {
  // Support both old signature and new options object
  const options: UseContentOptions = typeof sectionOrOptions === 'string'
    ? { section: sectionOrOptions, locale: localeArg }
    : sectionOrOptions || {};

  const { page, section, locale = 'en' } = options;

  const [content, setContent] = useState<ContentMap>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const params = new URLSearchParams({ locale });
        if (page) params.set('page', page);
        if (section) params.set('section', section);

        const res = await fetch(`/api/content?${params}`);
        const data = await res.json();

        if (data.content && Object.keys(data.content).length > 0) {
          setContent((prev) => ({ ...prev, ...data.content }));
        }
      } catch (err) {
        console.error('Failed to fetch content:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [page, section, locale]);

  const get = (key: string, fallback?: string): string => {
    return content[key] || fallback || defaultContent[key] || '';
  };

  return { content, get, loading };
}

// Server-side content fetcher
export async function getContent(locale: string = 'en'): Promise<ContentMap> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/content?locale=${locale}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    const data = await res.json();
    return { ...defaultContent, ...data.content };
  } catch {
    return defaultContent;
  }
}
