import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

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

// Validation schemas for update (all fields optional)
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

const projectUpdateSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(1).optional(),
  client: z.string().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'paused', 'archived', 'completed']).optional(),
  oneLiner: z.string().min(1).optional(),
  essence: z.string().min(1).optional(),
  productUrls: z.array(z.string().url()).optional(),
  owner: z.string().optional().nullable(),
  techLead: z.string().optional().nullable(),
  team: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  stack: stackSchema.optional(),
  environments: z.array(environmentSchema).optional(),
  links: z.array(linkSchema).optional(),
  instructions: instructionsSchema.optional(),
  operations: operationsSchema.optional(),
  security: securitySchema.nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

function serializeProject(doc: FirebaseFirestore.DocumentSnapshot): Record<string, any> | null {
  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    ...data,
    startDate: data.startDate?.toDate?.()?.toISOString() || null,
    endDate: data.endDate?.toDate?.()?.toISOString() || null,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    security: data.security ? {
      ...data.security,
      lastSecurityReview: data.security.lastSecurityReview?.toDate?.()?.toISOString() || null,
    } : null,
    activityLog: data.activityLog?.map((log: any) => ({
      ...log,
      timestamp: log.timestamp?.toDate?.()?.toISOString() || null,
    })) || [],
  };
}

// GET - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const doc = await db.collection('projects').doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = doc.data()!;
    let project = serializeProject(doc)!;

    // Check if there's a matching legacy portfolio item
    if (!projectData.portfolio?.published) {
      const portfolioSnapshot = await db.collection('portfolio').get();
      for (const portfolioDoc of portfolioSnapshot.docs) {
        const portfolioData = portfolioDoc.data();
        if (portfolioData.slug === projectData.key || portfolioData.slug === projectData.portfolio?.slug) {
          // Found matching legacy item - mark portfolio as legacy
          project = {
            ...project,
            portfolio: {
              ...(project.portfolio || {}),
              published: true,
              showOnHomepage: portfolioData.showOnHomepage || false,
              isLegacy: true,
            }
          };
          break;
        }
      }
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = projectUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getAdminDb();
    const docRef = db.collection('projects').doc(params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const existingData = doc.data()!;

    // Check for duplicate key if key is being changed
    if (data.key && data.key !== existingData.key) {
      const existingKey = await db.collection('projects')
        .where('key', '==', data.key)
        .get();

      const isDuplicate = existingKey.docs.some(d => d.id !== params.id);
      if (isDuplicate) {
        return NextResponse.json(
          { error: 'A project with this key already exists' },
          { status: 400 }
        );
      }
    }

    const now = Timestamp.now();

    // Build activity log entry
    const changedFields: string[] = [];
    for (const key of Object.keys(data)) {
      if (JSON.stringify(data[key as keyof typeof data]) !== JSON.stringify(existingData[key])) {
        changedFields.push(key);
      }
    }

    const activityEntry = {
      id: `activity_${Date.now()}`,
      action: data.status && data.status !== existingData.status ? 'status_changed' : 'updated',
      field: changedFields.length === 1 ? changedFields[0] : undefined,
      oldValue: data.status !== existingData.status ? existingData.status : undefined,
      newValue: data.status !== existingData.status ? data.status : undefined,
      timestamp: now,
      userId: user.uid,
      userEmail: user.email || 'unknown',
    };

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
      updatedBy: user.email || user.uid,
      activityLog: [...(existingData.activityLog || []), activityEntry],
    };

    // Convert date strings to Timestamps
    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    } else if (data.startDate === null) {
      updateData.startDate = null;
    }

    if (data.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
    } else if (data.endDate === null) {
      updateData.endDate = null;
    }

    if (data.security?.lastSecurityReview) {
      updateData.security = {
        ...data.security,
        lastSecurityReview: Timestamp.fromDate(new Date(data.security.lastSecurityReview)),
      };
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      project: serializeProject(updatedDoc),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// PATCH - Quick update for specific fields (like portfolio toggle)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const db = getAdminDb();
    const docRef = db.collection('projects').doc(params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const existingData = doc.data()!;
    const now = Timestamp.now();

    // Handle portfolio toggle
    if ('portfolio' in body) {
      const existingPortfolio = existingData.portfolio || {};
      const newPortfolio = { ...existingPortfolio, ...body.portfolio };

      // Set publishedAt when first publishing
      if (body.portfolio.published === true && !existingPortfolio.publishedAt) {
        newPortfolio.publishedAt = now;
      }

      // Create activity entry
      const activityEntry = {
        id: `activity_${Date.now()}`,
        action: 'portfolio_updated',
        field: body.portfolio.published !== undefined ? 'portfolio.published' :
               body.portfolio.showOnHomepage !== undefined ? 'portfolio.showOnHomepage' : 'portfolio',
        oldValue: body.portfolio.published !== undefined
          ? String(existingPortfolio.published || false)
          : body.portfolio.showOnHomepage !== undefined
            ? String(existingPortfolio.showOnHomepage || false)
            : undefined,
        newValue: body.portfolio.published !== undefined
          ? String(body.portfolio.published)
          : body.portfolio.showOnHomepage !== undefined
            ? String(body.portfolio.showOnHomepage)
            : undefined,
        timestamp: now,
        userId: user.uid,
        userEmail: user.email || 'unknown',
      };

      await docRef.update({
        portfolio: newPortfolio,
        updatedAt: now,
        updatedBy: user.email || user.uid,
        activityLog: [...(existingData.activityLog || []), activityEntry],
      });
    }

    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      project: serializeProject(updatedDoc),
    });
  } catch (error) {
    console.error('Error patching project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const docRef = db.collection('projects').doc(params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
