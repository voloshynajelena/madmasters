'use client';

import { useEffect, useState } from 'react';

interface ContentMap {
  [key: string]: string;
}

// Default content fallbacks
const defaultContent: ContentMap = {
  'hero.title': 'We Build Digital Experiences',
  'hero.subtitle': 'Transform your ideas into powerful digital products that drive results.',
  'hero.cta_primary': 'Start Your Project',
  'hero.cta_secondary': 'View Our Work',
  'about.title': 'About Mad Masters',
  'about.description': 'We are a team of passionate developers, designers, and strategists dedicated to building exceptional digital products.',
  'about.years_experience': '10+',
  'about.projects_completed': '150+',
  'about.happy_clients': '50+',
  'services.title': 'Our Services',
  'services.subtitle': 'Comprehensive digital solutions for modern businesses',
  'contact.title': 'Get In Touch',
  'contact.subtitle': "Ready to start your project? Let's talk.",
  'contact.email': 'hello@madmasters.pro',
  'contact.phone': '+380 96 477 7690',
  'footer.copyright': '© 2024 Mad Masters. All rights reserved.',
  'footer.tagline': 'Building the future, one pixel at a time.',
};

export function useContent(section?: string, locale: string = 'en') {
  const [content, setContent] = useState<ContentMap>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const params = new URLSearchParams({ locale });
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
  }, [section, locale]);

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
