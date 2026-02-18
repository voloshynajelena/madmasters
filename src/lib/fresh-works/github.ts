/**
 * GitHub API integration for Fresh Works feature
 * Fetches repos, releases, and activity metrics
 */

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  topics: string[];
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
}

export interface FreshWorkItem {
  sourceId: string;
  source: 'github';
  title: string;
  description: string;
  platform: string;
  lastActivity: string;
  url: string;
  metrics: {
    stars?: number;
    forks?: number;
    version?: string;
  };
  tags: string[];
}

// TODO: Set this in environment variables
const GITHUB_ORG = process.env.GITHUB_ORG || 'madmasters';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function fetchGitHubRepos(): Promise<FreshWorkItem[]> {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    // Fetch repos
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_ORG}/repos?sort=pushed&per_page=20`,
      { headers, next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!reposRes.ok) {
      console.error('GitHub API error:', reposRes.status);
      return [];
    }

    const repos: GitHubRepo[] = await reposRes.json();

    // Filter out forks and archived repos, get only public repos with recent activity
    const activeRepos = repos
      .filter(repo => !repo.name.startsWith('.'))
      .slice(0, 10);

    // Fetch latest release for each repo
    const items: FreshWorkItem[] = await Promise.all(
      activeRepos.map(async (repo) => {
        let latestVersion: string | undefined;

        try {
          const releasesRes = await fetch(
            `https://api.github.com/repos/${repo.full_name}/releases/latest`,
            { headers, next: { revalidate: 3600 } }
          );

          if (releasesRes.ok) {
            const release: GitHubRelease = await releasesRes.json();
            latestVersion = release.tag_name;
          }
        } catch {
          // No releases, that's fine
        }

        return {
          sourceId: `github-${repo.id}`,
          source: 'github' as const,
          title: repo.name,
          description: repo.description || '',
          platform: repo.language || 'Code',
          lastActivity: repo.pushed_at,
          url: repo.html_url,
          metrics: {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            version: latestVersion,
          },
          tags: repo.topics || [],
        };
      })
    );

    return items;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}
