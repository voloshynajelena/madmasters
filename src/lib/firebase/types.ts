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

// ============ MESSAGES ============

export type MessageSource = 'contact' | 'brief' | 'calculator' | 'telegram' | 'other';
export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Message {
  id: string;
  source: MessageSource;
  status: MessageStatus;

  name: string;
  email: string;
  phone?: string;
  subject?: string;
  body: string;

  // Additional form data
  metadata?: Record<string, unknown>;

  // Tracking
  page?: string;
  locale?: string;
  referrer?: string;
  userAgent?: string;

  // Telegram notification status
  telegramSent?: boolean;
  telegramMessageId?: number;

  // Timestamps
  createdAt: Timestamp;
  readAt?: Timestamp;
  readBy?: string;
  repliedAt?: Timestamp;
  repliedBy?: string;
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

// ============ PROJECTS KNOWLEDGE BASE ============

export type ProjectStatus = 'active' | 'maintenance' | 'paused' | 'archived' | 'completed';

export type ProjectType = 'internal' | 'client';

export type EnvironmentType = 'DEV' | 'STAGE' | 'PROD' | 'DEMO' | 'QA';

export type LinkType =
  | 'REPO'
  | 'JIRA'
  | 'FIGMA'
  | 'SENTRY'
  | 'VERCEL'
  | 'AWS'
  | 'GCP'
  | 'FIREBASE'
  | 'SUPABASE'
  | 'AUTH'
  | 'DATABASE'
  | 'STORAGE'
  | 'ANALYTICS'
  | 'MONITORING'
  | 'DOCS'
  | 'WEBSITE'
  | 'SLACK'
  | 'NOTION'
  | 'CONFLUENCE'
  | 'OTHER';

export type PIILevel = 'none' | 'low' | 'medium' | 'high' | 'unknown';

export interface ProjectStack {
  frontend: {
    name: string;
    version?: string;
    notes?: string;
  };
  backend: {
    name: string;
    version?: string;
    notes?: string;
  };
  database: {
    name: string;
    version?: string;
    notes?: string;
  };
  hosting: {
    name: string;
    notes?: string;
  };
  auth: {
    name: string;
    notes?: string;
  };
  cicd?: {
    name: string;
    notes?: string;
  };
  analytics?: {
    name: string;
    notes?: string;
  };
  monitoring?: {
    name: string;
    notes?: string;
  };
  additionalTools?: Array<{
    category: string;
    name: string;
    notes?: string;
  }>;
}

export interface ProjectEnvironment {
  type: EnvironmentType;
  url: string;
  notes?: string;
  healthCheckUrl?: string;
}

export interface ProjectLink {
  type: LinkType;
  label: string;
  url: string;
  notes?: string;
}

export interface ProjectInstructions {
  localSetupMd: string;
  deployMd: string;
  testingMd: string;
  runbookMd: string;
  knownIssuesMd: string;
}

export interface ProjectOperations {
  sla?: string;
  backups?: string;
  pii: PIILevel;
  dataRegion?: string;
  secretsLocation?: string; // e.g., "1Password vault: ProjectName"
  onCallRotation?: string;
  incidentProcess?: string;
}

export interface ProjectSecurity {
  authMethod?: string;
  dataEncryption?: string;
  complianceNotes?: string;
  lastSecurityReview?: Timestamp;
  securityContactEmail?: string;
}

export interface ProjectActivityLog {
  id: string;
  action: 'created' | 'updated' | 'status_changed' | 'exported';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Timestamp;
  userId: string;
  userEmail: string;
}

export interface Project {
  id: string;
  key: string; // unique slug/identifier
  name: string;
  client?: string;
  status: ProjectStatus;
  type: ProjectType; // internal or client project

  // Core info
  oneLiner: string; // short description
  essence: string; // what the project is about
  productUrls: string[];

  // Team
  owner?: string;
  techLead?: string;
  team: string[];
  tags: string[];

  // Technical
  stack: ProjectStack;
  environments: ProjectEnvironment[];
  links: ProjectLink[];
  instructions: ProjectInstructions;

  // Operations & Security
  operations: ProjectOperations;
  security?: ProjectSecurity;

  // Dates
  startDate?: Timestamp;
  endDate?: Timestamp;

  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;

  // Activity log stored as subcollection or array
  activityLog?: ProjectActivityLog[];
}

// Input types for creating/updating (without server-generated fields)
export interface ProjectInput {
  key: string;
  name: string;
  client?: string;
  status: ProjectStatus;
  type: ProjectType;
  oneLiner: string;
  essence: string;
  productUrls: string[];
  owner?: string;
  techLead?: string;
  team: string[];
  tags: string[];
  stack: ProjectStack;
  environments: ProjectEnvironment[];
  links: ProjectLink[];
  instructions: ProjectInstructions;
  operations: ProjectOperations;
  security?: ProjectSecurity;
  startDate?: string; // ISO string for form input
  endDate?: string;
}
