import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import ExcelJS from 'exceljs';

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

interface ImportProject {
  key: string;
  name: string;
  client?: string;
  status?: string;
  type?: 'internal' | 'client';
  oneLiner: string;
  essence: string;
  productUrls?: string[];
  owner?: string;
  techLead?: string;
  team?: string[];
  tags?: string[];
  stack?: {
    frontend?: { name: string; version?: string; notes?: string };
    backend?: { name: string; version?: string; notes?: string };
    database?: { name: string; version?: string; notes?: string };
    hosting?: { name: string; notes?: string };
    auth?: { name: string; notes?: string };
    cicd?: { name: string; notes?: string };
    analytics?: { name: string; notes?: string };
    monitoring?: { name: string; notes?: string };
  };
  environments?: Array<{ type: string; url: string; notes?: string }>;
  links?: Array<{ type: string; label: string; url: string; notes?: string }>;
  instructions?: {
    localSetupMd?: string;
    deployMd?: string;
    testingMd?: string;
    runbookMd?: string;
    knownIssuesMd?: string;
  };
  operations?: {
    sla?: string;
    backups?: string;
    pii?: string;
    dataRegion?: string;
    secretsLocation?: string;
    onCallRotation?: string;
    incidentProcess?: string;
  };
  security?: {
    authMethod?: string;
    dataEncryption?: string;
    complianceNotes?: string;
  };
  documentation?: {
    envVarsTemplate?: string;
    databaseSchema?: string;
    apiEndpoints?: string;
    seedData?: string;
    changelog?: string;
    cicdPipeline?: string;
  };
}

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ key: string; error: string }>;
  projects: Array<{ key: string; id: string; action: 'created' | 'updated' | 'skipped' }>;
}

const DEFAULT_STACK = {
  frontend: { name: 'TBD', version: '', notes: '' },
  backend: { name: 'TBD', version: '', notes: '' },
  database: { name: 'TBD', version: '', notes: '' },
  hosting: { name: 'TBD', notes: '' },
  auth: { name: 'TBD', notes: '' },
  cicd: { name: '', notes: '' },
  analytics: { name: '', notes: '' },
  monitoring: { name: '', notes: '' },
};

const DEFAULT_INSTRUCTIONS = {
  localSetupMd: '## Local Setup\n\nTBD',
  deployMd: '## Deployment\n\nTBD',
  testingMd: '## Testing\n\nTBD',
  runbookMd: '## Runbook\n\nTBD',
  knownIssuesMd: '## Known Issues\n\nNone documented.',
};

const DEFAULT_OPERATIONS = {
  sla: '',
  backups: '',
  pii: 'unknown',
  dataRegion: '',
  secretsLocation: '',
  onCallRotation: '',
  incidentProcess: '',
};

const DEFAULT_DOCUMENTATION = {
  envVarsTemplate: '',
  databaseSchema: '',
  apiEndpoints: '',
  seedData: '',
  changelog: '',
  cicdPipeline: '',
};

function validateProject(project: any, index: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!project.key || typeof project.key !== 'string') {
    errors.push(`Row ${index + 1}: Missing or invalid 'key'`);
  } else if (!/^[a-z0-9-]+$/.test(project.key)) {
    errors.push(`Row ${index + 1}: Key must be lowercase alphanumeric with hyphens`);
  }

  if (!project.name || typeof project.name !== 'string') {
    errors.push(`Row ${index + 1}: Missing or invalid 'name'`);
  }

  if (!project.oneLiner || typeof project.oneLiner !== 'string') {
    errors.push(`Row ${index + 1}: Missing or invalid 'oneLiner'`);
  }

  if (!project.essence || typeof project.essence !== 'string') {
    errors.push(`Row ${index + 1}: Missing or invalid 'essence'`);
  }

  return { valid: errors.length === 0, errors };
}

function normalizeProject(raw: any): ImportProject {
  return {
    key: String(raw.key || '').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    name: String(raw.name || ''),
    client: raw.client || '',
    status: raw.status || 'active',
    type: raw.type === 'internal' ? 'internal' : 'client',
    oneLiner: String(raw.oneLiner || ''),
    essence: String(raw.essence || ''),
    productUrls: Array.isArray(raw.productUrls) ? raw.productUrls :
      (raw.productUrls ? String(raw.productUrls).split(',').map(s => s.trim()).filter(Boolean) : []),
    owner: raw.owner || '',
    techLead: raw.techLead || '',
    team: Array.isArray(raw.team) ? raw.team :
      (raw.team ? String(raw.team).split(',').map(s => s.trim()).filter(Boolean) : []),
    tags: Array.isArray(raw.tags) ? raw.tags :
      (raw.tags ? String(raw.tags).split(',').map(s => s.trim()).filter(Boolean) : []),
    stack: raw.stack || DEFAULT_STACK,
    environments: Array.isArray(raw.environments) ? raw.environments : [],
    links: Array.isArray(raw.links) ? raw.links : [],
    instructions: raw.instructions || DEFAULT_INSTRUCTIONS,
    operations: raw.operations || DEFAULT_OPERATIONS,
    security: raw.security || {},
    documentation: raw.documentation || DEFAULT_DOCUMENTATION,
  };
}

async function parseExcel(buffer: ArrayBuffer): Promise<ImportProject[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const projects: ImportProject[] = [];
  const projectsSheet = workbook.getWorksheet('Projects') || workbook.getWorksheet(1);

  if (!projectsSheet) {
    throw new Error('No Projects sheet found');
  }

  // Get headers from first row
  const headers: string[] = [];
  const headerRow = projectsSheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  });

  // Map common header variations
  const headerMap: Record<string, string> = {
    'key': 'key',
    'projectkey': 'key',
    'name': 'name',
    'projectname': 'name',
    'client': 'client',
    'status': 'status',
    'type': 'type',
    'projecttype': 'type',
    'oneliner': 'oneLiner',
    'description': 'oneLiner',
    'essence': 'essence',
    'about': 'essence',
    'producturls': 'productUrls',
    'urls': 'productUrls',
    'owner': 'owner',
    'techlead': 'techLead',
    'team': 'team',
    'tags': 'tags',
    'frontend': 'frontend',
    'backend': 'backend',
    'database': 'database',
    'hosting': 'hosting',
    'auth': 'auth',
    'piilevel': 'pii',
    'pii': 'pii',
    'dataregion': 'dataRegion',
    'secretslocation': 'secretsLocation',
    'sla': 'sla',
  };

  // Parse data rows
  projectsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const rowData: Record<string, any> = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      const mappedHeader = headerMap[header] || header;
      rowData[mappedHeader] = cell.value;
    });

    // Skip empty rows
    if (!rowData.key && !rowData.name) return;

    // Build stack from flat columns if present
    if (rowData.frontend || rowData.backend || rowData.database) {
      rowData.stack = {
        frontend: { name: rowData.frontend || 'TBD', version: '', notes: '' },
        backend: { name: rowData.backend || 'TBD', version: '', notes: '' },
        database: { name: rowData.database || 'TBD', version: '', notes: '' },
        hosting: { name: rowData.hosting || 'TBD', notes: '' },
        auth: { name: rowData.auth || 'TBD', notes: '' },
        cicd: { name: '', notes: '' },
        analytics: { name: '', notes: '' },
        monitoring: { name: '', notes: '' },
      };
    }

    // Build operations from flat columns if present
    if (rowData.pii || rowData.sla || rowData.dataRegion) {
      rowData.operations = {
        sla: rowData.sla || '',
        backups: '',
        pii: rowData.pii || 'unknown',
        dataRegion: rowData.dataRegion || '',
        secretsLocation: rowData.secretsLocation || '',
        onCallRotation: '',
        incidentProcess: '',
      };
    }

    projects.push(normalizeProject(rowData));
  });

  // Try to parse Links sheet
  const linksSheet = workbook.getWorksheet('Links');
  if (linksSheet) {
    const linksByProject: Record<string, any[]> = {};

    linksSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const projectKey = String(row.getCell(1).value || '').toLowerCase();
      const link = {
        type: String(row.getCell(3).value || 'OTHER'),
        label: String(row.getCell(4).value || ''),
        url: String(row.getCell(5).value || ''),
        notes: String(row.getCell(6).value || ''),
      };

      if (projectKey && link.url) {
        if (!linksByProject[projectKey]) linksByProject[projectKey] = [];
        linksByProject[projectKey].push(link);
      }
    });

    // Attach links to projects
    projects.forEach(project => {
      if (linksByProject[project.key]) {
        project.links = linksByProject[project.key];
      }
    });
  }

  // Try to parse Environments sheet
  const envsSheet = workbook.getWorksheet('Environments');
  if (envsSheet) {
    const envsByProject: Record<string, any[]> = {};

    envsSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const projectKey = String(row.getCell(1).value || '').toLowerCase();
      const env = {
        type: String(row.getCell(3).value || 'PROD'),
        url: String(row.getCell(4).value || ''),
        notes: String(row.getCell(5).value || ''),
      };

      if (projectKey && env.url) {
        if (!envsByProject[projectKey]) envsByProject[projectKey] = [];
        envsByProject[projectKey].push(env);
      }
    });

    // Attach environments to projects
    projects.forEach(project => {
      if (envsByProject[project.key]) {
        project.environments = envsByProject[project.key];
      }
    });
  }

  // Try to parse Instructions sheet
  const instructionsSheet = workbook.getWorksheet('Instructions');
  if (instructionsSheet) {
    const instructionsByProject: Record<string, any> = {};

    instructionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const projectKey = String(row.getCell(1).value || '').toLowerCase();
      if (projectKey) {
        instructionsByProject[projectKey] = {
          localSetupMd: String(row.getCell(3).value || DEFAULT_INSTRUCTIONS.localSetupMd),
          deployMd: String(row.getCell(4).value || DEFAULT_INSTRUCTIONS.deployMd),
          testingMd: String(row.getCell(5).value || DEFAULT_INSTRUCTIONS.testingMd),
          runbookMd: String(row.getCell(6).value || DEFAULT_INSTRUCTIONS.runbookMd),
          knownIssuesMd: String(row.getCell(7).value || DEFAULT_INSTRUCTIONS.knownIssuesMd),
        };
      }
    });

    // Attach instructions to projects
    projects.forEach(project => {
      if (instructionsByProject[project.key]) {
        project.instructions = instructionsByProject[project.key];
      }
    });
  }

  // Try to parse Documentation sheet
  const docsSheet = workbook.getWorksheet('Documentation');
  if (docsSheet) {
    const docsByProject: Record<string, any> = {};

    docsSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const projectKey = String(row.getCell(1).value || '').toLowerCase();
      if (projectKey) {
        docsByProject[projectKey] = {
          envVarsTemplate: String(row.getCell(3).value || ''),
          databaseSchema: String(row.getCell(4).value || ''),
          apiEndpoints: String(row.getCell(5).value || ''),
          seedData: String(row.getCell(6).value || ''),
          changelog: String(row.getCell(7).value || ''),
          cicdPipeline: String(row.getCell(8).value || ''),
        };
      }
    });

    // Attach documentation to projects
    projects.forEach(project => {
      if (docsByProject[project.key]) {
        project.documentation = docsByProject[project.key];
      }
    });
  }

  return projects;
}

function parseJSON(content: string): ImportProject[] {
  const data = JSON.parse(content);

  // Support both { projects: [...] } and direct array
  const rawProjects = Array.isArray(data) ? data : (data.projects || []);

  return rawProjects.map(normalizeProject);
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = formData.get('mode') as string || 'skip'; // 'skip' | 'update' | 'overwrite'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let projects: ImportProject[] = [];

    // Parse file based on type
    if (fileName.endsWith('.json')) {
      const content = await file.text();
      projects = parseJSON(content);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      projects = await parseExcel(buffer);
    } else {
      return NextResponse.json({
        error: 'Unsupported file type. Use .json or .xlsx'
      }, { status: 400 });
    }

    if (projects.length === 0) {
      return NextResponse.json({ error: 'No projects found in file' }, { status: 400 });
    }

    // Validate all projects first
    const validationErrors: Array<{ key: string; error: string }> = [];
    projects.forEach((project, index) => {
      const validation = validateProject(project, index);
      if (!validation.valid) {
        validationErrors.push({
          key: project.key || `row-${index + 1}`,
          error: validation.errors.join('; ')
        });
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors,
      }, { status: 400 });
    }

    // Import projects
    const db = getAdminDb();
    const projectsRef = db.collection('projects');
    const now = Timestamp.now();
    const result: ImportResult = {
      success: true,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      projects: [],
    };

    for (const projectData of projects) {
      try {
        // Check if project exists
        const existingQuery = await projectsRef.where('key', '==', projectData.key).get();
        const exists = !existingQuery.empty;

        if (exists && mode === 'skip') {
          result.skipped++;
          result.projects.push({ key: projectData.key, id: existingQuery.docs[0].id, action: 'skipped' });
          continue;
        }

        const docRef = exists ? existingQuery.docs[0].ref : projectsRef.doc();
        const existingData = exists ? existingQuery.docs[0].data() : null;

        const projectDoc = {
          id: docRef.id,
          key: projectData.key,
          name: projectData.name,
          client: projectData.client || '',
          status: projectData.status || 'active',
          type: projectData.type || 'client',
          oneLiner: projectData.oneLiner,
          essence: projectData.essence,
          productUrls: projectData.productUrls || [],
          owner: projectData.owner || '',
          techLead: projectData.techLead || '',
          team: projectData.team || [],
          tags: projectData.tags || [],
          stack: projectData.stack || DEFAULT_STACK,
          environments: projectData.environments || [],
          links: projectData.links || [],
          instructions: projectData.instructions || DEFAULT_INSTRUCTIONS,
          operations: projectData.operations || DEFAULT_OPERATIONS,
          security: projectData.security || {},
          documentation: projectData.documentation || DEFAULT_DOCUMENTATION,
          createdAt: exists ? existingData?.createdAt : now,
          updatedAt: now,
          updatedBy: user.email || user.uid,
          activityLog: [
            ...(exists ? (existingData?.activityLog || []) : []),
            {
              id: `activity_${Date.now()}`,
              action: exists ? 'updated' : 'created',
              field: 'import',
              timestamp: now,
              userId: user.uid,
              userEmail: user.email || 'import',
            },
          ],
        };

        if (mode === 'overwrite' || !exists) {
          await docRef.set(projectDoc);
        } else if (mode === 'update') {
          // Merge - keep existing values for empty fields
          const mergedDoc = { ...existingData, ...projectDoc };
          await docRef.set(mergedDoc);
        }

        if (exists) {
          result.updated++;
          result.projects.push({ key: projectData.key, id: docRef.id, action: 'updated' });
        } else {
          result.created++;
          result.projects.push({ key: projectData.key, id: docRef.id, action: 'created' });
        }
      } catch (err) {
        result.errors.push({
          key: projectData.key,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    result.success = result.errors.length === 0;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Import failed'
    }, { status: 500 });
  }
}
