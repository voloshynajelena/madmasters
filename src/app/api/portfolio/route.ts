import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export interface PublicPortfolioProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
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
}

const COLLECTION = 'portfolio';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    // If fetching single project by slug
    if (slug) {
      const snapshot = await db
        .collection(COLLECTION)
        .where('slug', '==', slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const doc = snapshot.docs[0];
      const project = { id: doc.id, ...doc.data() } as PublicPortfolioProject;

      // Get related projects (same category)
      const relatedSnapshot = await db
        .collection(COLLECTION)
        .where('category', '==', project.category)
        .where('status', '==', 'published')
        .orderBy('order', 'asc')
        .limit(4)
        .get();

      const relatedProjects: PublicPortfolioProject[] = [];
      relatedSnapshot.forEach((relDoc) => {
        if (relDoc.id !== doc.id) {
          relatedProjects.push({ id: relDoc.id, ...relDoc.data() } as PublicPortfolioProject);
        }
      });

      return NextResponse.json({
        project,
        relatedProjects: relatedProjects.slice(0, 3),
      });
    }

    // Fetch all published projects
    let query: FirebaseFirestore.Query = db
      .collection(COLLECTION)
      .where('status', '==', 'published');

    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    query = query.orderBy('order', 'asc');

    const snapshot = await query.get();
    const projects: PublicPortfolioProject[] = [];

    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as PublicPortfolioProject);
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
