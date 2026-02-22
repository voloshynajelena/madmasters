import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

type CategoryType = 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

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

export interface PublicPortfolioProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  category?: string; // Legacy single category
  categories?: string[]; // New multi-select categories
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
  showOnHomepage?: boolean;
}

// Helper to get categories from a project (handles legacy)
function getProjectCategories(project: PublicPortfolioProject): string[] {
  const cats: string[] = [];
  if (project.categories && project.categories.length > 0) {
    cats.push(...project.categories);
  } else if (project.category) {
    cats.push(project.category);
  }
  // Normalize and return
  const normalized = normalizeCategories(cats.length > 0 ? cats : ['web']);
  return normalized.length > 0 ? normalized : ['web'];
}

// Static fallback portfolio data
const staticProjects: PublicPortfolioProject[] = [
  { id: '1', slug: 'orangeschool', name: 'Orange School', description: 'Linguistic center website with online booking', fullDescription: 'A comprehensive website for a language learning center featuring course booking, student portal, and multi-language support.', category: 'web', tags: ['Education', 'Booking'], thumbnail: '/content/img/portfolio/orangeschool.png', images: ['/content/img/portfolio/orangeschool.png'], client: 'Orange School', industry: 'Education', year: 2023, services: ['Web Design', 'Development', 'CMS'], technologies: ['React', 'Node.js', 'PostgreSQL'] },
  { id: '2', slug: 'yudenko', name: 'Yudenko', description: 'Designer portfolio showcasing creative work', fullDescription: 'An elegant portfolio website for a creative designer, featuring smooth animations and a minimalist aesthetic.', category: 'web', tags: ['Portfolio', 'Creative'], thumbnail: '/content/img/portfolio/yudenko.png', images: ['/content/img/portfolio/yudenko.png'], client: 'Yudenko Studio', industry: 'Design', year: 2023, services: ['Web Design', 'Development'], technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'] },
  { id: '3', slug: 'slimbeauty', name: 'Slim Beauty', description: 'Massage salon booking platform', fullDescription: 'A modern booking platform for a wellness spa, featuring online appointments, service catalog, and customer reviews.', category: 'web', tags: ['Wellness', 'Booking'], thumbnail: '/content/img/portfolio/slimbeauty.png', images: ['/content/img/portfolio/slimbeauty.png'], client: 'Slim Beauty Spa', industry: 'Wellness', year: 2022, services: ['Web Design', 'Development', 'Booking System'], technologies: ['React', 'Node.js', 'MongoDB'] },
  { id: '4', slug: 'dneprlaw', name: 'Dneprlaw', description: 'Legal services firm website', fullDescription: 'Professional website for a law firm featuring service descriptions, attorney profiles, and contact forms.', category: 'web', tags: ['Legal', 'Corporate'], thumbnail: '/content/img/portfolio/dneprlaw.png', images: ['/content/img/portfolio/dneprlaw.png'], client: 'Dneprlaw', industry: 'Legal', year: 2022, services: ['Web Design', 'Development'], technologies: ['WordPress', 'PHP', 'MySQL'] },
  { id: '5', slug: 'winplast', name: 'Winplast', description: 'Windows & doors manufacturer', fullDescription: 'Corporate website for a manufacturing company featuring product catalog, configurator, and dealer locator.', category: 'web', tags: ['Manufacturing', 'B2B'], thumbnail: '/content/img/portfolio/winplast.png', images: ['/content/img/portfolio/winplast.png'], client: 'Winplast', industry: 'Manufacturing', year: 2022, services: ['Web Design', 'Development', 'Product Catalog'], technologies: ['React', 'Node.js', 'PostgreSQL'] },
  { id: '6', slug: 'macarons', name: 'Macarons', description: 'Artisan bakery e-commerce', fullDescription: 'Beautiful e-commerce website for an artisan bakery featuring online ordering and delivery scheduling.', category: 'e-commerce', tags: ['Food', 'E-commerce'], thumbnail: '/content/img/portfolio/macarons.png', images: ['/content/img/portfolio/macarons.png'], client: 'Macarons Bakery', industry: 'Food & Beverage', year: 2023, services: ['E-commerce', 'Web Design', 'Payment Integration'], technologies: ['Shopify', 'Liquid', 'JavaScript'] },
  { id: '7', slug: 'avocado', name: 'Avocado', description: 'Health food e-commerce platform', fullDescription: 'Subscription-based health food delivery platform with personalized meal plans and recurring orders.', category: 'e-commerce', tags: ['Health Food', 'Subscription'], thumbnail: '/content/img/portfolio/avocado.png', images: ['/content/img/portfolio/avocado.png'], client: 'Avocado Foods', industry: 'Food & Beverage', year: 2023, services: ['E-commerce', 'Subscription System', 'Mobile App'], technologies: ['React Native', 'Node.js', 'Stripe'] },
  { id: '8', slug: 'teplogarant', name: 'Teplogarant', description: 'Heating systems company', fullDescription: 'Corporate website for HVAC company featuring service calculator, maintenance scheduling, and customer portal.', category: 'web', tags: ['Industrial', 'B2B'], thumbnail: '/content/img/portfolio/teplogarant.png', images: ['/content/img/portfolio/teplogarant.png'], client: 'Teplogarant', industry: 'HVAC', year: 2021, services: ['Web Design', 'Development', 'Calculator'], technologies: ['Vue.js', 'Laravel', 'MySQL'] },
  { id: '9', slug: 'photovis', name: 'Photovis', description: 'Photography studio website', fullDescription: 'Portfolio website for a photography studio with gallery, booking system, and client proofing area.', category: 'web', tags: ['Photography', 'Portfolio'], thumbnail: '/content/img/portfolio/photovis.png', images: ['/content/img/portfolio/photovis.png'], client: 'Photovis Studio', industry: 'Photography', year: 2022, services: ['Web Design', 'Gallery System', 'Booking'], technologies: ['Next.js', 'Cloudinary', 'PostgreSQL'] },
  { id: '10', slug: 'atlantika', name: 'Atlantika', description: 'Travel agency booking platform', fullDescription: 'Full-featured travel booking platform with tour packages, hotel reservations, and itinerary planning.', category: 'e-commerce', tags: ['Travel', 'Booking'], thumbnail: '/content/img/portfolio/portfolio-atlantika.png', images: ['/content/img/portfolio/portfolio-atlantika.png'], client: 'Atlantika Travel', industry: 'Travel', year: 2023, services: ['E-commerce', 'Booking System', 'API Integration'], technologies: ['React', 'Node.js', 'GraphQL'] },
  { id: '11', slug: 'best-pc', name: 'Best PC', description: 'Computer hardware store', fullDescription: 'E-commerce platform for computer hardware with PC configurator, price comparison, and reviews.', category: 'e-commerce', tags: ['Electronics', 'E-commerce'], thumbnail: '/content/img/portfolio/best-pc.png', images: ['/content/img/portfolio/best-pc.png'], client: 'Best PC', industry: 'Retail', year: 2022, services: ['E-commerce', 'Product Configurator', 'Inventory'], technologies: ['WooCommerce', 'PHP', 'MySQL'] },
  { id: '12', slug: 'btech', name: 'B-Tech', description: 'Technology consulting firm', fullDescription: 'Corporate website for IT consulting firm with service pages, case studies, and team profiles.', category: 'web', tags: ['Technology', 'B2B'], thumbnail: '/content/img/portfolio/btech.png', images: ['/content/img/portfolio/btech.png'], client: 'B-Tech Solutions', industry: 'Technology', year: 2023, services: ['Web Design', 'Development', 'SEO'], technologies: ['Next.js', 'Tailwind CSS', 'Sanity CMS'] },
];

const COLLECTION = 'portfolio';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const slug = url.searchParams.get('slug');

    // If fetching single project by slug
    if (slug) {
      // First try to find in static data
      const staticProject = staticProjects.find(p => p.slug === slug);

      try {
        const db = getAdminDb();

        // Try projects collection first (KB items)
        const projectsSnapshot = await db.collection('projects').get();
        for (const doc of projectsSnapshot.docs) {
          const data = doc.data();
          const projectSlug = data.portfolio?.slug || data.key;
          if (projectSlug === slug && data.portfolio?.published && !data.portfolio?.hidden) {
            const stackTechnologies = [
              data.stack?.frontend?.name,
              data.stack?.backend?.name,
              data.stack?.database?.name,
            ].filter(t => t && t !== 'TBD') as string[];

            const project: PublicPortfolioProject = {
              id: doc.id,
              slug: projectSlug,
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
              technologies: data.portfolio.technologies?.length ? data.portfolio.technologies : stackTechnologies,
              liveUrl: data.productUrls?.[0] || '',
              challenge: data.portfolio.challenge || '',
              solution: data.portfolio.solution || '',
              results: data.portfolio.results || [],
              testimonial: data.portfolio.testimonial || null,
              showOnHomepage: data.portfolio.showOnHomepage || false,
            };

            const relatedProjects = staticProjects
              .filter(p => p.slug !== slug)
              .slice(0, 3);

            return NextResponse.json({
              project,
              relatedProjects,
            });
          }
        }

        // Try legacy portfolio collection
        const snapshot = await db
          .collection(COLLECTION)
          .where('slug', '==', slug)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          if (data.status === 'published' && !data.hidden) {
            const normalizedCats = data.categories
              ? normalizeCategories(data.categories)
              : data.category
                ? normalizeCategories([data.category])
                : [];
            const project = { id: doc.id, ...data, categories: normalizedCats } as PublicPortfolioProject;

            // Get related projects from static data
            const relatedProjects = staticProjects
              .filter(p => p.category === project.category && p.slug !== slug)
              .slice(0, 3);

            return NextResponse.json({
              project,
              relatedProjects,
            });
          }
        }

        // Also try searching by generated slug from name in legacy collection
        const allPortfolio = await db.collection(COLLECTION).get();
        for (const doc of allPortfolio.docs) {
          const data = doc.data();
          const generatedSlug = generateSlug(data.name || '');
          if (generatedSlug === slug && data.status === 'published' && !data.hidden) {
            const normalizedCats = data.categories
              ? normalizeCategories(data.categories)
              : data.category
                ? normalizeCategories([data.category])
                : [];
            const project = { id: doc.id, slug, ...data, categories: normalizedCats } as PublicPortfolioProject;

            const relatedProjects = staticProjects
              .filter(p => p.slug !== slug)
              .slice(0, 3);

            return NextResponse.json({
              project,
              relatedProjects,
            });
          }
        }
      } catch (dbError) {
        console.error('Database error, using static data:', dbError);
      }

      // Use static project if found
      if (staticProject) {
        const relatedProjects = staticProjects
          .filter(p => p.category === staticProject.category && p.slug !== slug)
          .slice(0, 3);

        return NextResponse.json({
          project: staticProject,
          relatedProjects,
        });
      }

      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch all published projects
    let projects: PublicPortfolioProject[] = [];

    try {
      const db = getAdminDb();

      // Fetch from projects collection (KB items with portfolio.published = true)
      const projectsSnapshot = await db.collection('projects').get();
      projectsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.portfolio?.published && !data.portfolio?.hidden) {
          const stackTechnologies = [
            data.stack?.frontend?.name,
            data.stack?.backend?.name,
            data.stack?.database?.name,
          ].filter(t => t && t !== 'TBD') as string[];

          projects.push({
            id: doc.id,
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
            technologies: data.portfolio.technologies?.length ? data.portfolio.technologies : stackTechnologies,
            liveUrl: data.productUrls?.[0] || '',
            challenge: data.portfolio.challenge || '',
            solution: data.portfolio.solution || '',
            results: data.portfolio.results || [],
            testimonial: data.portfolio.testimonial || null,
            showOnHomepage: data.portfolio.showOnHomepage || false,
          } as PublicPortfolioProject);
        }
      });

      // Also fetch from legacy portfolio collection
      const snapshot = await db.collection(COLLECTION).get();
      const existingSlugs = new Set(projects.map(p => p.slug));

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include published items that are not hidden and not duplicates
        if (data.status === 'published' && !data.hidden && !existingSlugs.has(data.slug)) {
          const normalizedCats = data.categories
            ? normalizeCategories(data.categories)
            : data.category
              ? normalizeCategories([data.category])
              : [];
          projects.push({
            id: doc.id,
            ...data,
            categories: normalizedCats,
          } as PublicPortfolioProject);
        }
      });
    } catch (dbError) {
      console.error('Database error, using static data:', dbError);
    }

    // If no projects from database, use static data
    if (projects.length === 0) {
      projects = [...staticProjects];
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      const normalizedFilter = normalizeCategory(category);
      if (normalizedFilter) {
        projects = projects.filter(p => getProjectCategories(p).includes(normalizedFilter));
      }
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ projects: staticProjects });
  }
}
