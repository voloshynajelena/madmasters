import type { Timestamp } from 'firebase-admin/firestore';

// ============ COMMON TYPES ============

export interface MediaRef {
  url: string;
  path: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SEOMeta {
  title: string;
  description: string;
  ogImage?: string;
}

// ============ CASE STUDIES ============

export interface LocalizedCaseStudy {
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  order: number;

  locales: {
    en: LocalizedCaseStudy;
    fr?: LocalizedCaseStudy;
  };

  client: string;
  industry: string;
  services: ('web' | 'marketing' | 'custom')[];
  technologies: string[];
  date: Timestamp;
  liveUrl?: string;

  thumbnail: MediaRef;
  heroImage: MediaRef;
  gallery: MediaRef[];

  metrics: Array<{
    key: string;
    value: string;
    icon?: string;
  }>;

  seo: {
    en: SEOMeta;
    fr?: SEOMeta;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============ TESTIMONIALS ============

export interface Testimonial {
  id: string;
  status: 'draft' | 'published';
  order: number;

  locales: {
    en: { quote: string };
    fr?: { quote: string };
  };

  author: string;
  role: string;
  company: string;
  avatar?: MediaRef;
  caseStudyId?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============ PROMOTIONS ============

export interface LocalizedPromotion {
  title: string;
  description: string;
  ctaText: string;
}

export interface Promotion {
  id: string;
  status: 'draft' | 'published';

  locales: {
    en: LocalizedPromotion;
    fr?: LocalizedPromotion;
  };

  ctaUrl: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============ RELEASES ============

export interface LocalizedRelease {
  title: string;
  body: string;
}

export interface Release {
  id: string;
  status: 'draft' | 'published';

  locales: {
    en: LocalizedRelease;
    fr?: LocalizedRelease;
  };

  type: 'announcement' | 'update' | 'launch';
  date: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============ ORDERS ============

export type OrderType = 'brief' | 'calculator' | 'contact';
export type OrderStatus = 'new' | 'reviewed' | 'archived';

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;

  name: string;
  email: string;
  phone?: string;
  message?: string;

  data: Record<string, unknown>;

  locale: string;
  page: string;
  referrer?: string;
  userAgent?: string;

  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

// ============ FRESH WORKS ============

export interface FreshWorkItem {
  sourceId: string;
  source: 'github' | 'appstore';
  title: string;
  platform: string;
  lastActivity: string;
  url: string;
  summary: string;
  metrics: {
    stars?: number;
    forks?: number;
    downloads?: number;
    rating?: number;
    version?: string;
  };
}

export interface FreshWorkCache {
  id: string;
  items: FreshWorkItem[];
  fetchedAt: Timestamp;
  error?: string;
}

export interface FreshWorkOverride {
  id: string;
  source: 'github' | 'appstore';
  pinned: boolean;
  hidden: boolean;
  summaryOverride?: string;
  tagsOverride?: string[];
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============ USERS ============

export type UserRole = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

// ============ SERVICES ============

export interface LocalizedService {
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
}

export interface Service {
  id: string;

  locales: {
    en: LocalizedService;
    fr?: LocalizedService;
  };

  icon: string;
  features: string[];
  relatedCaseStudyIds: string[];

  seo: {
    en: SEOMeta;
    fr?: SEOMeta;
  };

  updatedAt: Timestamp;
  updatedBy: string;
}
