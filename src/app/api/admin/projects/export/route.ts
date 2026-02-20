import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
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

interface ProjectData {
  id: string;
  key: string;
  name: string;
  client?: string;
  status: string;
  type?: 'internal' | 'client';
  oneLiner: string;
  essence: string;
  productUrls: string[];
  owner?: string;
  techLead?: string;
  team: string[];
  tags: string[];
  stack: {
    frontend: { name: string; version?: string; notes?: string };
    backend: { name: string; version?: string; notes?: string };
    database: { name: string; version?: string; notes?: string };
    hosting: { name: string; notes?: string };
    auth: { name: string; notes?: string };
    cicd?: { name: string; notes?: string };
    analytics?: { name: string; notes?: string };
    monitoring?: { name: string; notes?: string };
  };
  environments: Array<{
    type: string;
    url: string;
    notes?: string;
  }>;
  links: Array<{
    type: string;
    label: string;
    url: string;
    notes?: string;
  }>;
  instructions: {
    localSetupMd: string;
    deployMd: string;
    testingMd: string;
    runbookMd: string;
    knownIssuesMd: string;
  };
  operations: {
    sla?: string;
    backups?: string;
    pii: string;
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
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

function setColumnWidths(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: false }, cell => {
      const cellValue = cell.value?.toString() || '';
      maxLength = Math.max(maxLength, Math.min(cellValue.length + 2, 60));
    });
    column.width = maxLength;
  });
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
  headerRow.height = 25;
}

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');

    // Fetch projects
    let snapshot;
    if (projectId) {
      const doc = await db.collection('projects').doc(projectId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      snapshot = { docs: [doc] };
    } else {
      snapshot = await db.collection('projects').get();
    }

    let projects: ProjectData[] = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        key: data.key || '',
        name: data.name || '',
        client: data.client,
        status: data.status || '',
        type: data.type || 'client',
        oneLiner: data.oneLiner || '',
        essence: data.essence || '',
        productUrls: data.productUrls || [],
        owner: data.owner,
        techLead: data.techLead,
        team: data.team || [],
        tags: data.tags || [],
        stack: data.stack || {},
        environments: data.environments || [],
        links: data.links || [],
        instructions: data.instructions || {},
        operations: data.operations || {},
        security: data.security,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        updatedBy: data.updatedBy,
      };
    });

    // Apply filters
    if (status) {
      projects = projects.filter(p => p.status === status);
    }
    if (tag) {
      projects = projects.filter(p => p.tags?.includes(tag));
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Projects Knowledge Base';
    workbook.created = new Date();

    // Sheet 1: Projects Overview
    const projectsSheet = workbook.addWorksheet('Projects');
    projectsSheet.columns = [
      { header: 'Key', key: 'key' },
      { header: 'Name', key: 'name' },
      { header: 'Client', key: 'client' },
      { header: 'Status', key: 'status' },
      { header: 'Type', key: 'type' },
      { header: 'One-liner', key: 'oneLiner' },
      { header: 'Essence', key: 'essence' },
      { header: 'Product URLs', key: 'productUrls' },
      { header: 'Owner', key: 'owner' },
      { header: 'Tech Lead', key: 'techLead' },
      { header: 'Team', key: 'team' },
      { header: 'Tags', key: 'tags' },
      { header: 'Frontend', key: 'frontend' },
      { header: 'Backend', key: 'backend' },
      { header: 'Database', key: 'database' },
      { header: 'Hosting', key: 'hosting' },
      { header: 'Auth', key: 'auth' },
      { header: 'PII Level', key: 'pii' },
      { header: 'Data Region', key: 'dataRegion' },
      { header: 'Secrets Location', key: 'secretsLocation' },
      { header: 'SLA', key: 'sla' },
      { header: 'Updated At', key: 'updatedAt' },
      { header: 'Updated By', key: 'updatedBy' },
    ];

    projects.forEach(project => {
      projectsSheet.addRow({
        key: project.key,
        name: project.name,
        client: project.client || '',
        status: project.status,
        type: project.type || 'client',
        oneLiner: project.oneLiner,
        essence: project.essence,
        productUrls: project.productUrls?.join(', ') || '',
        owner: project.owner || '',
        techLead: project.techLead || '',
        team: project.team?.join(', ') || '',
        tags: project.tags?.join(', ') || '',
        frontend: `${project.stack?.frontend?.name || ''} ${project.stack?.frontend?.version || ''}`.trim(),
        backend: `${project.stack?.backend?.name || ''} ${project.stack?.backend?.version || ''}`.trim(),
        database: `${project.stack?.database?.name || ''} ${project.stack?.database?.version || ''}`.trim(),
        hosting: project.stack?.hosting?.name || '',
        auth: project.stack?.auth?.name || '',
        pii: project.operations?.pii || '',
        dataRegion: project.operations?.dataRegion || '',
        secretsLocation: project.operations?.secretsLocation || '',
        sla: project.operations?.sla || '',
        updatedAt: project.updatedAt || '',
        updatedBy: project.updatedBy || '',
      });
    });

    styleHeader(projectsSheet);
    setColumnWidths(projectsSheet);

    // Sheet 2: Links
    const linksSheet = workbook.addWorksheet('Links');
    linksSheet.columns = [
      { header: 'Project Key', key: 'projectKey' },
      { header: 'Project Name', key: 'projectName' },
      { header: 'Link Type', key: 'type' },
      { header: 'Label', key: 'label' },
      { header: 'URL', key: 'url' },
      { header: 'Notes', key: 'notes' },
    ];

    projects.forEach(project => {
      project.links?.forEach(link => {
        linksSheet.addRow({
          projectKey: project.key,
          projectName: project.name,
          type: link.type,
          label: link.label,
          url: link.url,
          notes: link.notes || '',
        });
      });
    });

    styleHeader(linksSheet);
    setColumnWidths(linksSheet);

    // Sheet 3: Environments
    const envsSheet = workbook.addWorksheet('Environments');
    envsSheet.columns = [
      { header: 'Project Key', key: 'projectKey' },
      { header: 'Project Name', key: 'projectName' },
      { header: 'Environment', key: 'type' },
      { header: 'URL', key: 'url' },
      { header: 'Notes', key: 'notes' },
    ];

    projects.forEach(project => {
      project.environments?.forEach(env => {
        envsSheet.addRow({
          projectKey: project.key,
          projectName: project.name,
          type: env.type,
          url: env.url,
          notes: env.notes || '',
        });
      });
    });

    styleHeader(envsSheet);
    setColumnWidths(envsSheet);

    // Sheet 4: Instructions
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [
      { header: 'Project Key', key: 'projectKey' },
      { header: 'Project Name', key: 'projectName' },
      { header: 'Local Setup', key: 'localSetupMd' },
      { header: 'Deploy', key: 'deployMd' },
      { header: 'Testing', key: 'testingMd' },
      { header: 'Runbook', key: 'runbookMd' },
      { header: 'Known Issues', key: 'knownIssuesMd' },
    ];

    projects.forEach(project => {
      instructionsSheet.addRow({
        projectKey: project.key,
        projectName: project.name,
        localSetupMd: project.instructions?.localSetupMd || '',
        deployMd: project.instructions?.deployMd || '',
        testingMd: project.instructions?.testingMd || '',
        runbookMd: project.instructions?.runbookMd || '',
        knownIssuesMd: project.instructions?.knownIssuesMd || '',
      });
    });

    // Enable text wrapping for markdown columns
    instructionsSheet.columns.forEach((col, index) => {
      if (index >= 2) {
        col.width = 50;
      }
    });
    instructionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { wrapText: true, vertical: 'top' };
      }
    });

    styleHeader(instructionsSheet);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = projectId
      ? `project-${projects[0]?.key || projectId}-${timestamp}.xlsx`
      : `projects-knowledge-base-${timestamp}.xlsx`;

    // Log export activity
    if (!projectId) {
      // Log that all projects were exported - could add to audit log
      console.log(`Projects exported by ${user.email} at ${new Date().toISOString()}`);
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error exporting projects:', error);
    return NextResponse.json({ error: 'Failed to export projects' }, { status: 500 });
  }
}
