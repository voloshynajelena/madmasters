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

/**
 * What a component actually is.
 *
 * A project is rarely one thing any more. Librora is a web app, an iOS app,
 * iOS widgets and iOS Live Activities; Job Tracker is a web app and a Chrome
 * extension. The flat `stack` on a project could describe only one of those,
 * so everything after the first was either lost or crammed into notes — and a
 * knowledge base that cannot say "the widget is SwiftUI and ships with the
 * iOS app" is missing the part somebody actually needs at 2am.
 */
export type ComponentKind =
  | 'web'
  | 'mobile-ios'
  | 'mobile-android'
  | 'mobile-cross'
  | 'ios-widget'
  | 'ios-live-activity'
  | 'watch'
  | 'browser-extension'
  | 'api'
  | 'functions'
  | 'cli'
  | 'desktop'
  | 'bot'
  | 'infra'
  | 'other';

export const COMPONENT_KIND_LABELS: Record<ComponentKind, string> = {
  web: 'Web app',
  'mobile-ios': 'iOS app',
  'mobile-android': 'Android app',
  'mobile-cross': 'Cross-platform mobile',
  'ios-widget': 'iOS widget',
  'ios-live-activity': 'iOS Live Activity',
  watch: 'Watch app',
  'browser-extension': 'Browser extension',
  api: 'API',
  functions: 'Serverless functions',
  cli: 'CLI',
  desktop: 'Desktop app',
  bot: 'Bot',
  infra: 'Infrastructure',
  other: 'Other',
};

/**
 * One shippable piece of a project.
 *
 * Everything is optional except what identifies it, because the whole point is
 * to be able to record a component the moment it exists rather than when
 * somebody has time to fill in a form. A component with a name and a kind is
 * already more than the old model could hold.
 */
export interface ProjectComponent {
  key: string; // unique within the project
  name: string;
  kind: ComponentKind;
  oneLiner?: string;
  /// Where it lives in the repository — "apps/mobile", "extension",
  /// "ios/LibroraWidget". The single most useful field here in practice.
  path?: string;
  /// Its own stack, when it differs from the project's. A widget written in
  /// SwiftUI inside a React Native app is exactly this case.
  stack?: ProjectComponentStack;
  /// Where it is published: an App Store listing, a store item, a domain.
  distribution?: string;
  environments?: ProjectEnvironment[];
  links?: ProjectLink[];
  status?: ProjectStatus;
  notes?: string;
}

/** Deliberately looser than `ProjectStack`: a widget has no database and an
 *  extension has no hosting, and forcing empty strings into those slots is how
 *  a knowledge base fills up with noise. */
/**
 * A technical decision, and why it was right *here*.
 *
 * The stack fields say what was chosen. They never say why, and the why is
 * the only part that cannot be recovered by opening the repository: six
 * months later "Firestore" is visible and "because the mobile app has to work
 * on the subway and Firestore's offline persistence is free" is not. Without
 * it every past choice looks arbitrary and gets relitigated.
 *
 * `alternatives` matters as much as the choice. A decision with no rejected
 * option was not a decision, it was a default — and saying so plainly is
 * useful too.
 */
export interface ProjectDecision {
  title: string;
  choice: string;
  /// Why it suits this project specifically, not why it is good in general.
  rationale: string;
  alternatives?: string;
  /// What it costs. Every real choice has a price and writing it down is what
  /// stops the next person thinking it was free.
  tradeoffs?: string;
  date?: string;
}

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskArea =
  | 'security' | 'privacy' | 'reliability' | 'cost' | 'compliance'
  | 'maintenance' | 'performance' | 'vendor';
export type RiskStatus = 'open' | 'planned' | 'mitigated' | 'accepted';

/**
 * Something that could go wrong, and what would fix it.
 *
 * Kept with the project rather than in a ticket tracker because the ones that
 * matter are rarely tickets: an open sign-up, a single shared API key, a
 * backup nobody has restored. They are known, unwritten, and remembered only
 * by whoever found them.
 *
 * `accepted` is a real status. A risk that has been looked at and knowingly
 * lived with is in a different state from one nobody has read.
 */
export interface ProjectRisk {
  title: string;
  area: RiskArea;
  severity: RiskSeverity;
  detail: string;
  /// What to actually do about it.
  mitigation?: string;
  status: RiskStatus;
}

export type CostPeriod = 'monthly' | 'yearly' | 'one-off' | 'usage';

/** What the project costs to keep alive. Unknown amounts are left null rather
 *  than estimated: a made-up number in a budget is worse than a blank. */
export interface ProjectCost {
  item: string;
  provider?: string;
  plan?: string;
  amount?: number | null;
  currency?: string;
  period: CostPeriod;
  renewsOn?: string;
  notes?: string;
}

export type RegistrationKind =
  | 'domain' | 'developer-account' | 'app-store' | 'service' | 'trademark' | 'other';

/** Where something is registered, by whom, and when it lapses. The field that
 *  earns this section is `expiresOn`: a domain that quietly expires takes the
 *  product down and nobody is watching for it. */
export interface ProjectRegistration {
  kind: RegistrationKind;
  name: string;
  registrar?: string;
  accountEmail?: string;
  registeredOn?: string;
  expiresOn?: string;
  autoRenew?: boolean;
  url?: string;
  notes?: string;
}

export interface ProjectComponentStack {
  language?: string;
  framework?: string;
  runtime?: string;
  hosting?: string;
  notes?: string;
}

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
  /// The shippable pieces. Optional so every record written before this
  /// existed stays valid — a project with one component and nothing to say
  /// about it is still described perfectly well by `stack` alone.
  components?: ProjectComponent[];
  /// Why the stack is what it is, what could bite, and what it costs to run.
  /// All optional: a project with none of them is simply undocumented, which
  /// is where every project starts.
  decisions?: ProjectDecision[];
  risks?: ProjectRisk[];
  costs?: ProjectCost[];
  registrations?: ProjectRegistration[];
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
  components?: ProjectComponent[];
  decisions?: ProjectDecision[];
  risks?: ProjectRisk[];
  costs?: ProjectCost[];
  registrations?: ProjectRegistration[];
  environments: ProjectEnvironment[];
  links: ProjectLink[];
  instructions: ProjectInstructions;
  operations: ProjectOperations;
  security?: ProjectSecurity;
  startDate?: string; // ISO string for form input
  endDate?: string;
}

/* ======================================================================== */
/* Portfolio versions                                                        */
/* ======================================================================== */

/**
 * A tailored copy of the portfolio, aimed at one application.
 *
 * The knowledge base holds what is true about a project. A portfolio version
 * holds what is worth saying about it to one particular reader, and the two
 * must not be the same record: tuning a project's wording for a backend role
 * would otherwise rewrite the project itself, and the next application would
 * start from the last one's spin rather than from the facts.
 *
 * So a version is a snapshot. Creating one copies the current knowledge base
 * into it; after that the two drift apart on purpose, and `resync` is how a
 * single item is deliberately pulled back to what the project now says.
 */
export interface PortfolioVersion {
  id: string;
  /** What this version is for — "Senior Frontend, Shopify". */
  name: string;
  targetRole?: string;
  targetCompany?: string;
  /** A reminder to self about what was emphasised and why. */
  notes?: string;
  status: 'draft' | 'ready';
  profile: PortfolioProfile;
  items: PortfolioItem[];
  /** The CV this version was seeded from, kept so the source is traceable. */
  cv?: PortfolioCvSource;
  /** How, and whether, this version can be opened without signing in. */
  share?: PortfolioShare;
  createdAt: FirebaseFirestore.Timestamp | Date | string;
  updatedAt: FirebaseFirestore.Timestamp | Date | string;
  updatedBy?: string;
}

/** The person, as this version presents them. */
export interface PortfolioProfile {
  fullName: string;
  headline: string;
  summary: string;
  location?: string;
  email?: string;
  phone?: string;
  links: { label: string; url: string }[];
  /** The headline stack — what a reader should take away in five seconds. */
  stack: string[];
  /**
   * The CV itself, offered from the page.
   *
   * The link goes on a résumé and the résumé is offered from the link —
   * whichever one an employer opens first, the other is one click away.
   */
  resumeUrl?: string;
  resumeLabel?: string;
}

/** Which blocks of a project this version shows. */
export interface PortfolioItemBlocks {
  description: boolean;
  stack: boolean;
  components: boolean;
  decisions: boolean;
  highlights: boolean;
  links: boolean;
}

/**
 * One project in one version.
 *
 * Everything below `projectKey` is a copy, free to be edited. `projectKey` is
 * the only link back, and it is a label rather than a reference: a project
 * deleted from the knowledge base leaves the version it was written into
 * intact, because an application already sent should not change.
 */
export interface PortfolioItem {
  projectKey: string;
  enabled: boolean;
  order: number;

  name: string;
  oneLiner: string;
  /** What the person did on it — absent from the knowledge base, which
   *  describes projects rather than contributions. */
  role?: string;
  period?: string;
  description: string;
  /// The product's own mark, shown as a badge on the tile.
  logo?: string;
  /// A wide capture of the running product. The tile is mostly this.
  screenshot?: string;
  /// Further images, shown in the details panel beneath the main one. The
  /// screenshot leads the gallery, so this holds only the rest.
  gallery?: string[];
  /// Kept for versions written before tiles had a screenshot, and used as the
  /// logo when no logo was set.
  thumbnail?: string;
  liveUrl?: string;
  tags: string[];
  stack: string[];
  /**
   * The pieces of the project, each a tab in the details panel.
   *
   * A project with a web app and an iOS app has two of nearly everything —
   * two stacks, two sets of screens, two things to say about it — and
   * flattening them into one description is how "React Native, Swift,
   * Next.js" ends up in a single list that describes nothing in particular.
   */
  components: {
    kind: ComponentKind | string;
    name: string;
    oneLiner?: string;
    /// Where it lives in the repository. Useful to the owner, shown to nobody.
    path?: string;
    /// Its own stack, which is the reason these are tabs and not bullet points.
    stack?: ProjectComponentStack;
    /// App Store listing, extension link, deployed URL.
    distribution?: string;
    notes?: string;
    /// Screens of this piece specifically: a phone's, not the web app's.
    screenshots?: string[];
  }[];
  decisions: { title: string; choice: string; rationale: string; tradeoffs?: string }[];
  /** Free-form bullets written for this application only. */
  highlights: string[];
  /**
   * What the repository says about how this was built.
   *
   * Taken from git rather than written: dates and subjects nobody composed
   * for a portfolio, which is the only reason they are worth reading. The
   * list is a sample spread across the project's life, not its last forty
   * commits.
   */
  history?: ProjectHistory;
  blocks: PortfolioItemBlocks;
}

/**
 * A link that opens this portfolio without a login.
 *
 * Off until it is switched on, and the address is a random token rather than
 * the portfolio's name: the page carries a phone number and an email, so a
 * guessable address would hand those to anyone who tried `/p/shopify`. The
 * page also asks search engines not to index it — a link meant for one
 * employer should not become a search result.
 *
 * Switching it off does not change the token, so turning sharing back on
 * revives the same address rather than breaking a link already sent.
 */
export interface PortfolioShare {
  enabled: boolean;
  slug: string;
  updatedAt?: string;
}

export interface ProjectHistory {
  commits: { hash: string; date: string; subject: string; kind: string }[];
  totalCommits: number;
  firstCommit: string;
  lastCommit: string;
  activeMonths: number;
  source?: string;
}

export interface PortfolioCvSource {
  fileName: string;
  importedAt: string;
  /** The extracted text, kept so a later version can be seeded without the
   *  original file being at hand. */
  text: string;
}

export interface PortfolioVersionInput {
  name: string;
  targetRole?: string;
  targetCompany?: string;
  notes?: string;
  status?: 'draft' | 'ready';
  profile: PortfolioProfile;
  items: PortfolioItem[];
  cv?: PortfolioCvSource;
  share?: PortfolioShare;
}
