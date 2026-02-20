/**
 * Projects Knowledge Base Seed Script
 *
 * Seeds initial projects from the JSON file into Firestore.
 * Run with: npx tsx scripts/seed-projects.ts
 *
 * Options:
 *   --force    Override existing projects (by key)
 *   --dry-run  Show what would be done without making changes
 *
 * Environment variables required:
 * - Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */

import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local for local development
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Parse command line arguments
const args = process.argv.slice(2);
const forceOverride = args.includes('--force');
const dryRun = args.includes('--dry-run');

// Initialize Firebase Admin
function initFirebase() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

interface SeedProject {
  key: string;
  name: string;
  client?: string;
  status: string;
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
}

interface SeedData {
  projects: SeedProject[];
}

async function seedProjects() {
  console.log('='.repeat(60));
  console.log('Projects Knowledge Base - Seed Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log(`Force override: ${forceOverride ? 'YES' : 'NO'}`);
  console.log('');

  // Load seed data
  const seedPath = path.join(__dirname, '../src/data/projects.seed.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found at ${seedPath}`);
  }

  const seedContent = fs.readFileSync(seedPath, 'utf-8');
  const seedData: SeedData = JSON.parse(seedContent);

  console.log(`Found ${seedData.projects.length} projects in seed file:`);
  seedData.projects.forEach(p => {
    console.log(`  - ${p.key}: ${p.name}`);
  });
  console.log('');

  if (dryRun) {
    console.log('DRY RUN: Would seed the above projects.');
    console.log('Run without --dry-run to actually seed.');
    return;
  }

  // Initialize Firebase
  initFirebase();
  const db = getFirestore();
  const projectsRef = db.collection('projects');

  const now = Timestamp.now();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const projectData of seedData.projects) {
    console.log(`Processing: ${projectData.key}...`);

    // Check if project exists
    const existingQuery = await projectsRef.where('key', '==', projectData.key).get();
    const exists = !existingQuery.empty;

    if (exists && !forceOverride) {
      console.log(`  SKIPPED (already exists, use --force to override)`);
      skipped++;
      continue;
    }

    const docRef = exists ? existingQuery.docs[0].ref : projectsRef.doc();

    const projectDoc = {
      id: docRef.id,
      ...projectData,
      createdAt: exists ? existingQuery.docs[0].data().createdAt : now,
      updatedAt: now,
      updatedBy: 'seed-script',
      activityLog: exists
        ? [
            ...(existingQuery.docs[0].data().activityLog || []),
            {
              id: `activity_${Date.now()}`,
              action: 'updated',
              timestamp: now,
              userId: 'system',
              userEmail: 'seed-script',
            },
          ]
        : [
            {
              id: `activity_${Date.now()}`,
              action: 'created',
              timestamp: now,
              userId: 'system',
              userEmail: 'seed-script',
            },
          ],
    };

    await docRef.set(projectDoc);

    if (exists) {
      console.log(`  UPDATED`);
      updated++;
    } else {
      console.log(`  CREATED (id: ${docRef.id})`);
      created++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Seed complete!');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log('='.repeat(60));
}

// Run
seedProjects()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
