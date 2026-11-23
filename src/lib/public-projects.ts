import 'server-only';

/**
 * One source for everything the public site shows about a project.
 *
 * There were three: `projects` (the knowledge base, with a `portfolio` block
 * on it), `portfolio` (a legacy collection), and `freshWorks` (a third shape
 * nothing rendered). The same project could exist in two of them with
 * different descriptions, and which one the site showed depended on which
 * query ran first.
 *
 * `projects` wins, because it is the one a human maintains and the only one
 * that knows a project has an iOS widget and a browser extension. The legacy
 * collection is still read, once, as a fallback for items that have not been
 * moved yet — and it is filtered by slug so a migrated project does not appear
 * twice under two descriptions.
 *
 * The mapping lived inline in two places inside the portfolio route, which is
 * why one of them had drifted. It lives here now.
 */
import { getAdminDb } from '@/lib/firebase/admin';

export type CategoryType = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

export interface PublicProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  categories: string[];
  tags: string[];
  thumbnail: string;
  images: string[];
  client: string;
  industry: string;
  year: number;
  services: string[];
  technologies: string[];
  liveUrl?: string;
  challenge?: string;
  solution?: string;
  results?: string[];
  testimonial?: { quote: string; author: string; role: string } | null;
  showOnHomepage?: boolean;
  /// What the project is made of — web, iOS, a widget, an extension. Public
  /// because "it has an iOS app and a Chrome extension" is the most
  /// interesting sentence about most of these.
  components?: { kind: string; name: string }[];
  /// When the project started. This is what "fresh" is sorted by.
  startedAt?: string;
}

const CATEGORY_ALIASES: Record<string, CategoryType> = {
  web: 'web',
  'web development': 'web',
  'web-development': 'web',
  'web app': 'web',
  'web-app': 'web',
  webapp: 'web',
  website: 'web',
  'e-commerce': 'e-commerce',
  ecommerce: 'e-commerce',
  'e commerce': 'e-commerce',
  branding: 'branding',
  brand: 'branding',
  marketing: 'marketing',
  mobile: 'mobile',
  'mobile apps': 'mobile',
  'mobile app': 'mobile',
};

export function normalizeCategories(categories: string[] = []): CategoryType[] {
  const out = new Set<CategoryType>();
  for (const raw of categories) {
    const hit = CATEGORY_ALIASES[raw.toLowerCase().trim()];
    if (hit) out.add(hit);
  }
  return Array.from(out);
}

/** A knowledge-base project as the public site sees it. */
function fromProject(id: string, data: Record<string, any>): PublicProject {
  const portfolio = data.portfolio ?? {};
  const stackTech = [
    data.stack?.frontend?.name,
    data.stack?.backend?.name,
    data.stack?.database?.name,
  ].filter((t: string) => t && t !== 'TBD');

  return {
    id,
    slug: portfolio.slug || data.key,
    name: data.name,
    description: data.oneLiner || '',
    fullDescription: portfolio.fullDescription || data.essence || '',
    categories: normalizeCategories(portfolio.categories),
    tags: portfolio.tags?.length ? portfolio.tags : data.tags ?? [],
    thumbnail: portfolio.thumbnail || '',
    images: portfolio.images ?? [],
    client: data.client || '',
    industry: portfolio.industry || '',
    year: portfolio.year || new Date().getFullYear(),
    services: portfolio.services ?? [],
    technologies: portfolio.technologies?.length ? portfolio.technologies : stackTech,
    liveUrl: data.productUrls?.[0] || '',
    challenge: portfolio.challenge || '',
    solution: portfolio.solution || '',
    results: portfolio.results ?? [],
    testimonial: portfolio.testimonial ?? null,
    showOnHomepage: Boolean(portfolio.showOnHomepage),
    components: (data.components ?? []).map((c: any) => ({ kind: c.kind, name: c.name })),
    startedAt: data.startDate || data.createdAt || undefined,
  };
}

/** A row from the legacy collection, shaped the same way. */
function fromLegacy(id: string, data: Record<string, any>): PublicProject {
  return {
    id,
    slug: data.slug,
    name: data.name,
    description: data.description || '',
    fullDescription: data.fullDescription || '',
    categories: normalizeCategories(data.categories ?? (data.category ? [data.category] : [])),
    tags: data.tags ?? [],
    thumbnail: data.thumbnail || '',
    images: data.images ?? [],
    client: data.client || '',
    industry: data.industry || '',
    year: data.year || new Date().getFullYear(),
    services: data.services ?? [],
    technologies: data.technologies ?? [],
    liveUrl: data.liveUrl || '',
    challenge: data.challenge || '',
    solution: data.solution || '',
    results: data.results ?? [],
    testimonial: data.testimonial ?? null,
    showOnHomepage: Boolean(data.showOnHomepage),
    startedAt: data.createdAt || undefined,
  };
}

/**
 * Everything published, knowledge base first.
 *
 * A legacy row whose slug already came from `projects` is dropped rather than
 * merged: two descriptions of one project is the problem this is here to end,
 * and the maintained one should win.
 */
export async function publishedProjects(): Promise<PublicProject[]> {
  const db = getAdminDb();
  const out: PublicProject[] = [];

  const projects = await db.collection('projects').get();
  projects.forEach(doc => {
    const data = doc.data();
    if (data.portfolio?.published && !data.portfolio?.hidden) {
      out.push(fromProject(doc.id, data));
    }
  });

  const seen = new Set(out.map(p => p.slug));
  const legacy = await db.collection('portfolio').get();
  legacy.forEach(doc => {
    const data = doc.data();
    if (data.status === 'published' && !data.hidden && !seen.has(data.slug)) {
      out.push(fromLegacy(doc.id, data));
    }
  });

  return out;
}

/**
 * The newest work.
 *
 * "Fresh" used to be a separate collection with its own admin and its own
 * shape, maintained by hand, which meant it was a second list to remember to
 * update and it was never up to date. It is derived now: the most recently
 * started projects, which cannot go stale because nobody has to touch it.
 */
export async function freshProjects(limit = 3): Promise<PublicProject[]> {
  const all = await publishedProjects();
  return all
    .sort((a, b) => {
      const at = a.startedAt ? Date.parse(a.startedAt) : 0;
      const bt = b.startedAt ? Date.parse(b.startedAt) : 0;
      // Falls back to the year when a project has no start date, so a legacy
      // row without one does not sort to the bottom forever.
      return bt - at || (b.year || 0) - (a.year || 0);
    })
    .slice(0, limit);
}
