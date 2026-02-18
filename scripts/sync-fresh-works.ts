/**
 * Fresh Works Sync Script
 *
 * Fetches data from GitHub and App Store APIs and stores in Firestore cache.
 * Run with: npm run sync-fresh
 *
 * Environment variables required:
 * - GITHUB_TOKEN: Personal access token with repo read access
 * - GITHUB_USERNAME: GitHub username or org to fetch repos from
 * - APPSTORE_APP_IDS: Comma-separated App Store app IDs
 * - Firebase Admin credentials (FIREBASE_PROJECT_ID, etc.)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
function initFirebase() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials');
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

interface FreshWorkItem {
  sourceId: string;
  source: 'github' | 'appstore';
  title: string;
  platform: string;
  lastActivity: string;
  url: string;
  summary: string;
  metrics: {
    stars?: number;
    forks?: number;
    downloads?: number;
    rating?: number;
    version?: string;
  };
}

// ============ GITHUB API ============

async function fetchGitHubRepos(): Promise<FreshWorkItem[]> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    console.warn('GitHub credentials not configured, skipping...');
    return [];
  }

  console.log(`Fetching GitHub repos for ${username}...`);

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MadMasters-FreshWorks-Sync',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    return repos
      .filter((repo: any) => !repo.fork && !repo.private)
      .slice(0, 10)
      .map((repo: any) => ({
        sourceId: repo.name,
        source: 'github' as const,
        title: repo.name,
        platform: detectPlatform(repo),
        lastActivity: repo.pushed_at,
        url: repo.html_url,
        summary: repo.description || 'No description available',
        metrics: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
        },
      }));
  } catch (error) {
    console.error('GitHub fetch error:', error);
    return [];
  }
}

function detectPlatform(repo: any): string {
  const lang = repo.language?.toLowerCase() || '';
  const topics = repo.topics || [];

  if (topics.includes('ios') || lang === 'swift') return 'iOS';
  if (topics.includes('android') || lang === 'kotlin') return 'Android';
  if (topics.includes('react-native') || topics.includes('flutter'))
    return 'Cross-platform';
  if (
    lang === 'javascript' ||
    lang === 'typescript' ||
    topics.includes('web')
  )
    return 'Web';

  return 'Other';
}

// ============ APP STORE API ============

async function fetchAppStoreApps(): Promise<FreshWorkItem[]> {
  const appIds = process.env.APPSTORE_APP_IDS;

  if (!appIds) {
    console.warn('App Store app IDs not configured, skipping...');
    return [];
  }

  const ids = appIds.split(',').map((id) => id.trim());
  console.log(`Fetching App Store data for ${ids.length} apps...`);

  const items: FreshWorkItem[] = [];

  for (const appId of ids) {
    try {
      // Using iTunes Search API (publicly available)
      const response = await fetch(
        `https://itunes.apple.com/lookup?id=${appId}&country=us`
      );

      if (!response.ok) {
        console.warn(`App Store API error for ${appId}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const app = data.results?.[0];

      if (!app) {
        console.warn(`App not found: ${appId}`);
        continue;
      }

      items.push({
        sourceId: appId,
        source: 'appstore',
        title: app.trackName,
        platform: 'iOS',
        lastActivity: app.currentVersionReleaseDate || app.releaseDate,
        url: app.trackViewUrl,
        summary: app.description?.slice(0, 200) || 'No description available',
        metrics: {
          rating: app.averageUserRating,
          version: app.version,
        },
      });
    } catch (error) {
      console.error(`Error fetching app ${appId}:`, error);
    }
  }

  return items;
}

// ============ MAIN SYNC FUNCTION ============

async function syncFreshWorks() {
  console.log('Starting Fresh Works sync...\n');

  initFirebase();
  const db = getFirestore();

  // Fetch from all sources in parallel
  const [githubItems, appstoreItems] = await Promise.all([
    fetchGitHubRepos(),
    fetchAppStoreApps(),
  ]);

  console.log(`\nFetched ${githubItems.length} GitHub repos`);
  console.log(`Fetched ${appstoreItems.length} App Store apps`);

  // Store in Firestore cache
  const batch = db.batch();
  const now = Timestamp.now();

  // GitHub cache
  batch.set(db.collection('freshWorkCache').doc('github'), {
    id: 'github',
    items: githubItems,
    fetchedAt: now,
    error: githubItems.length === 0 ? 'No items fetched' : null,
  });

  // App Store cache
  batch.set(db.collection('freshWorkCache').doc('appstore'), {
    id: 'appstore',
    items: appstoreItems,
    fetchedAt: now,
    error: appstoreItems.length === 0 ? 'No items fetched' : null,
  });

  await batch.commit();

  console.log('\nSync complete! Cached to Firestore.');
  console.log(`Total items: ${githubItems.length + appstoreItems.length}`);
}

// Run
syncFreshWorks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
