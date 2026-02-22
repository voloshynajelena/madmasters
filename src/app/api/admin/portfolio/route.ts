import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export type CategoryType = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

// Normalize category values (handles legacy data with labels instead of values)
function normalizeCategory(cat: string): CategoryType | null {
  const normalized = cat.toLowerCase().trim();
  const categoryMap: Record<string, CategoryType> = {
    'web': 'web',
    'web development': 'web',
    'web-development': 'web',
    'web app': 'web',
    'web-app': 'web',
    'webapp': 'web',
    'website': 'web',
    'e-commerce': 'e-commerce',
    'ecommerce': 'e-commerce',
    'e commerce': 'e-commerce',
    'branding': 'branding',
    'brand': 'branding',
    'marketing': 'marketing',
    'mobile': 'mobile',
    'mobile apps': 'mobile',
    'mobile app': 'mobile',
  };
  return categoryMap[normalized] || null;
}

function normalizeCategories(categories: string[]): CategoryType[] {
  const normalized = new Set<CategoryType>();
  for (const cat of categories) {
    const norm = normalizeCategory(cat);
    if (norm) normalized.add(norm);
  }
  return Array.from(normalized);
}

export interface PortfolioProject {
  id?: string;
  projectId?: string; // Reference to source project in projects collection
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  category?: CategoryType; // Legacy single category
  categories: CategoryType[]; // New multi-select categories
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
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  order: number;
  status: 'draft' | 'published';
  hidden?: boolean; // Hide from public website
  showOnHomepage?: boolean; // Show on homepage
  publishedAt?: string; // When it was first published
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION = 'portfolio';

async function verifySession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    return { ...decodedClaims, role: userData?.role };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Fetch from projects collection where portfolio.published is true
    const projectsSnapshot = await db.collection('projects').get();
    let projects: PortfolioProject[] = [];

    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include projects with portfolio.published = true
      if (data.portfolio?.published) {
        // Map project data to portfolio format
        const portfolioItem: PortfolioProject = {
          id: doc.id,
          projectId: doc.id, // Reference to source project
          slug: data.portfolio.slug || data.key,
          name: data.name,
          description: data.oneLiner || '',
          fullDescription: data.portfolio.fullDescription || data.essence || '',
          categories: normalizeCategories(data.portfolio.categories || []),
          tags: data.portfolio.tags?.length ? data.portfolio.tags : (data.tags || []),
          thumbnail: data.portfolio.thumbnail || '',
          images: data.portfolio.images || [],
          client: data.client || '',
          industry: data.portfolio.industry || '',
          year: data.portfolio.year || new Date().getFullYear(),
          services: data.portfolio.services || [],
          technologies: data.portfolio.technologies?.length
            ? data.portfolio.technologies
            : [
                data.stack?.frontend?.name,
                data.stack?.backend?.name,
                data.stack?.database?.name,
              ].filter(Boolean) as string[],
          liveUrl: data.productUrls?.[0] || '',
          challenge: data.portfolio.challenge || '',
          solution: data.portfolio.solution || '',
          results: data.portfolio.results || [],
          testimonial: data.portfolio.testimonial || null,
          order: data.portfolio.order || 0,
          status: data.portfolio.hidden ? 'draft' : 'published',
          hidden: data.portfolio.hidden || false,
          showOnHomepage: data.portfolio.showOnHomepage || false,
          publishedAt: data.portfolio.publishedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        };
        projects.push(portfolioItem);
      }
    });

    // Also fetch legacy portfolio items (for backwards compatibility)
    const legacySnapshot = await db.collection(COLLECTION).get();
    legacySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include if not already linked to a project
      if (!data.projectId) {
        // Normalize legacy categories
        const legacyCategories = data.categories
          ? normalizeCategories(data.categories)
          : data.category
            ? normalizeCategories([data.category])
            : [];
        projects.push({
          id: doc.id,
          ...data,
          categories: legacyCategories,
        } as PortfolioProject);
      }
    });

    // Filter by status
    if (status && status !== 'all') {
      projects = projects.filter(p => p.status === status);
    }

    // Filter by category
    if (category && category !== 'all') {
      const normalizedFilter = normalizeCategory(category);
      projects = projects.filter(p =>
        (p.category && normalizeCategory(p.category) === normalizedFilter) ||
        (p.categories && p.categories.includes(normalizedFilter as CategoryType))
      );
    }

    // Sort by order
    projects.sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !['admin', 'editor'].includes(session.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const data = await req.json();

    // Validate required fields
    if (!data.slug || !data.name || !data.client) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate slug
    const existingSlug = await db
      .collection(COLLECTION)
      .where('slug', '==', data.slug)
      .get();

    if (!existingSlug.empty) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Get max order
    const maxOrderQuery = await db
      .collection(COLLECTION)
      .orderBy('order', 'desc')
      .limit(1)
      .get();

    const maxOrder = maxOrderQuery.empty ? 0 : (maxOrderQuery.docs[0].data().order || 0);

    const project: Omit<PortfolioProject, 'id'> = {
      slug: data.slug,
      name: data.name,
      description: data.description || '',
      fullDescription: data.fullDescription || '',
      categories: data.categories || [],
      tags: data.tags || [],
      thumbnail: data.thumbnail || '',
      images: data.images || [],
      client: data.client,
      industry: data.industry || '',
      year: data.year || new Date().getFullYear(),
      services: data.services || [],
      technologies: data.technologies || [],
      liveUrl: data.liveUrl || '',
      challenge: data.challenge || '',
      solution: data.solution || '',
      results: data.results || [],
      testimonial: data.testimonial || null,
      order: maxOrder + 1,
      status: data.status || 'draft',
      hidden: data.hidden || false,
      showOnHomepage: data.showOnHomepage || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(project);

    return NextResponse.json({ id: docRef.id, ...project }, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}
