import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Verify admin auth
async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

// Validation schemas
const stackComponentSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  notes: z.string().optional(),
});

const stackSchema = z.object({
  frontend: stackComponentSchema,
  backend: stackComponentSchema,
  database: stackComponentSchema,
  hosting: z.object({ name: z.string(), notes: z.string().optional() }),
  auth: z.object({ name: z.string(), notes: z.string().optional() }),
  cicd: z.object({ name: z.string(), notes: z.string().optional() }).optional(),
  analytics: z.object({ name: z.string(), notes: z.string().optional() }).optional(),
  monitoring: z.object({ name: z.string(), notes: z.string().optional() }).optional(),
  additionalTools: z.array(z.object({
    category: z.string(),
    name: z.string(),
    notes: z.string().optional(),
  })).optional(),
});

const environmentSchema = z.object({
  type: z.enum(['DEV', 'STAGE', 'PROD', 'DEMO', 'QA']),
  url: z.string().url(),
  notes: z.string().optional(),
  healthCheckUrl: z.string().url().optional(),
});

const linkSchema = z.object({
  type: z.enum([
    'REPO', 'JIRA', 'FIGMA', 'SENTRY', 'VERCEL', 'AWS', 'GCP', 'FIREBASE',
    'SUPABASE', 'AUTH', 'DATABASE', 'STORAGE', 'ANALYTICS', 'MONITORING',
    'DOCS', 'WEBSITE', 'SLACK', 'NOTION', 'CONFLUENCE', 'OTHER'
  ]),
  label: z.string().min(1),
  url: z.string().url(),
  notes: z.string().optional(),
});

const instructionsSchema = z.object({
  localSetupMd: z.string(),
  deployMd: z.string(),
  testingMd: z.string(),
  runbookMd: z.string(),
  knownIssuesMd: z.string(),
});

const operationsSchema = z.object({
  sla: z.string().optional(),
  backups: z.string().optional(),
  pii: z.enum(['none', 'low', 'medium', 'high', 'unknown']),
  dataRegion: z.string().optional(),
  secretsLocation: z.string().optional(),
  onCallRotation: z.string().optional(),
  incidentProcess: z.string().optional(),
});

const securitySchema = z.object({
  authMethod: z.string().optional(),
  dataEncryption: z.string().optional(),
  complianceNotes: z.string().optional(),
  lastSecurityReview: z.string().optional(),
  securityContactEmail: z.string().email().optional(),
}).optional();

const projectSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Key must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  client: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'paused', 'archived', 'completed']),
  type: z.enum(['internal', 'client']).default('client'),
  oneLiner: z.string().min(1),
  essence: z.string().min(1),
  productUrls: z.array(z.string().url()),
  owner: z.string().optional(),
  techLead: z.string().optional(),
  team: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  stack: stackSchema,
  environments: z.array(environmentSchema).default([]),
  links: z.array(linkSchema).default([]),
  instructions: instructionsSchema,
  operations: operationsSchema,
  security: securitySchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET - List all projects with optional filters
export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const tag = searchParams.get('tag');
    const owner = searchParams.get('owner');

    // Fetch both projects and legacy portfolio items
    const [projectsSnapshot, portfolioSnapshot] = await Promise.all([
      db.collection('projects').get(),
      db.collection('portfolio').get(),
    ]);

    // Build a map of legacy portfolio items by slug for quick lookup
    const legacyPortfolioBySlug = new Map<string, { published: boolean; showOnHomepage: boolean }>();
    portfolioSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.slug) {
        legacyPortfolioBySlug.set(data.slug, {
          published: true, // If it exists in portfolio collection, it's "published"
          showOnHomepage: data.showOnHomepage || false,
        });
      }
    });

    let projects: any[] = projectsSnapshot.docs.map(doc => {
      const data = doc.data();

      // Check if this project has a matching legacy portfolio item
      const legacyPortfolio = legacyPortfolioBySlug.get(data.key) || legacyPortfolioBySlug.get(data.portfolio?.slug);

      // Merge portfolio info: prefer project's own portfolio data, fallback to legacy
      const portfolioInfo = data.portfolio?.published
        ? data.portfolio
        : legacyPortfolio
          ? { published: true, showOnHomepage: legacyPortfolio.showOnHomepage, isLegacy: true }
          : data.portfolio || null;

      return {
        id: doc.id,
        ...data,
        portfolio: portfolioInfo,
        startDate: data.startDate?.toDate?.()?.toISOString() || null,
        endDate: data.endDate?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        security: data.security ? {
          ...data.security,
          lastSecurityReview: data.security.lastSecurityReview?.toDate?.()?.toISOString() || null,
        } : null,
      };
    });

    // Apply filters
    if (status && ['active', 'maintenance', 'paused', 'archived', 'completed'].includes(status)) {
      projects = projects.filter(p => p.status === status);
    }

    if (search) {
      projects = projects.filter(p =>
        p.name?.toLowerCase().includes(search) ||
        p.key?.toLowerCase().includes(search) ||
        p.client?.toLowerCase().includes(search) ||
        p.oneLiner?.toLowerCase().includes(search)
      );
    }

    if (tag) {
      projects = projects.filter(p => p.tags?.includes(tag));
    }

    if (owner) {
      projects = projects.filter(p => p.owner === owner);
    }

    // Sort by name
    projects.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = projectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();

    // Check for duplicate key
    const existingKey = await db.collection('projects')
      .where('key', '==', data.key)
      .get();

    if (!existingKey.empty) {
      return NextResponse.json(
        { error: 'A project with this key already exists' },
        { status: 400 }
      );
    }

    const docRef = db.collection('projects').doc();
    const now = Timestamp.now();

    const project = {
      id: docRef.id,
      ...data,
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
      security: data.security ? {
        ...data.security,
        lastSecurityReview: data.security.lastSecurityReview
          ? Timestamp.fromDate(new Date(data.security.lastSecurityReview))
          : null,
      } : null,
      createdAt: now,
      updatedAt: now,
      updatedBy: user.email || user.uid,
      activityLog: [{
        id: `activity_${Date.now()}`,
        action: 'created',
        timestamp: now,
        userId: user.uid,
        userEmail: user.email || 'unknown',
      }],
    };

    await docRef.set(project);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      project: {
        ...project,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
