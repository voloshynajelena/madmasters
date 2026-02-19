import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export type CategoryType = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

export interface PortfolioProject {
  id?: string;
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

    // Fetch from portfolio collection only
    const portfolioSnapshot = await db.collection(COLLECTION).get();
    let projects: PortfolioProject[] = [];

    portfolioSnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as PortfolioProject);
    });

    // Filter by status
    if (status && status !== 'all') {
      projects = projects.filter(p => p.status === status);
    }

    // Filter by category
    if (category && category !== 'all') {
      projects = projects.filter(p => p.category === category);
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
