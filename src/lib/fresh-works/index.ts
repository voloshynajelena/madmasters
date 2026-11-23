import { fetchGitHubRepos, type FreshWorkItem as GitHubItem } from './github';
import { fetchAppStoreApps, type FreshWorkItem as AppStoreItem } from './appstore';

export type FreshWorkItem = GitHubItem | AppStoreItem;

export interface FreshWorkOverride {
  sourceId: string;
  pinned: boolean;
  hidden: boolean;
  summaryOverride?: string;
  tagsOverride?: string[];
}

export interface FreshWorksData {
  items: FreshWorkItem[];
  lastUpdated: string;
  error?: string;
}

/**
 * Fetch fresh works from all sources and apply overrides
 */
export async function fetchFreshWorks(
  overrides: FreshWorkOverride[] = []
): Promise<FreshWorksData> {
  try {
    // Fetch from all sources in parallel
    const [githubItems, appstoreItems] = await Promise.all([
      fetchGitHubRepos(),
      fetchAppStoreApps(),
    ]);

    let items: FreshWorkItem[] = [...githubItems, ...appstoreItems];

    // Apply overrides
    const overrideMap = new Map(overrides.map((o) => [o.sourceId, o]));

    items = items
      // Filter out hidden items
      .filter((item) => !overrideMap.get(item.sourceId)?.hidden)
      // Apply summary/tags overrides
      .map((item) => {
        const override = overrideMap.get(item.sourceId);
        if (!override) return item;

        return {
          ...item,
          description: override.summaryOverride || item.description,
          tags: override.tagsOverride || item.tags,
        };
      });

    // Sort: pinned first, then by lastActivity
    items.sort((a, b) => {
      const aPinned = overrideMap.get(a.sourceId)?.pinned || false;
      const bPinned = overrideMap.get(b.sourceId)?.pinned || false;

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return {
      items,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching fresh works:', error);
    return {
      items: [],
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch fresh works',
    };
  }
}

export { fetchGitHubRepos } from './github';
export { fetchAppStoreApps } from './appstore';
