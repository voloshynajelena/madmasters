/**
 * App Store (iTunes) API integration for Fresh Works feature
 * Uses public iTunes Search API - no authentication needed
 */

interface iTunesApp {
  trackId: number;
  trackName: string;
  description: string;
  artworkUrl512: string;
  trackViewUrl: string;
  averageUserRating: number;
  userRatingCount: number;
  version: string;
  currentVersionReleaseDate: string;
  genres: string[];
  sellerName: string;
}

interface iTunesSearchResult {
  resultCount: number;
  results: iTunesApp[];
}

export interface FreshWorkItem {
  sourceId: string;
  source: 'appstore';
  title: string;
  description: string;
  platform: string;
  lastActivity: string;
  url: string;
  imageUrl?: string;
  metrics: {
    rating?: number;
    downloads?: number;
    version?: string;
  };
  tags: string[];
}

// TODO: Set these in environment variables (comma-separated bundle IDs)
// Example: "com.madmasters.app1,com.madmasters.app2"
const APP_STORE_IDS = process.env.APPSTORE_APP_IDS?.split(',').filter(Boolean) || [];

export async function fetchAppStoreApps(): Promise<FreshWorkItem[]> {
  if (APP_STORE_IDS.length === 0) {
    console.log('No App Store IDs configured');
    return [];
  }

  try {
    const items: FreshWorkItem[] = [];

    for (const bundleId of APP_STORE_IDS) {
      try {
        const res = await fetch(
          `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId.trim())}`,
          { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!res.ok) continue;

        const data: iTunesSearchResult = await res.json();

        if (data.resultCount > 0) {
          const app = data.results[0];
          items.push({
            sourceId: `appstore-${app.trackId}`,
            source: 'appstore',
            title: app.trackName,
            description: app.description?.substring(0, 200) || '',
            platform: 'iOS',
            lastActivity: app.currentVersionReleaseDate,
            url: app.trackViewUrl,
            imageUrl: app.artworkUrl512,
            metrics: {
              rating: app.averageUserRating,
              downloads: app.userRatingCount, // Use rating count as proxy
              version: app.version,
            },
            tags: app.genres || [],
          });
        }
      } catch (err) {
        console.error(`Error fetching app ${bundleId}:`, err);
      }
    }

    return items;
  } catch (error) {
    console.error('Error fetching App Store apps:', error);
    return [];
  }
}
