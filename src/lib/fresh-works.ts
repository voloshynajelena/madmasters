export interface FreshWorkItem {
  id: string;
  source: 'web' | 'custom' | 'soft';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  platform?: string;
  tags: string[];
  metrics?: {
    stars?: number;
    forks?: number;
    rating?: number;
    version?: string;
    downloads?: string;
  };
  order: number;
  pinned: boolean;
  hidden: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FreshWorkOverride {
  sourceId: string;
  pinned: boolean;
  hidden: boolean;
  summaryOverride?: string;
}

export interface FreshWorksData {
  items: FreshWorkItem[];
  lastUpdated: string;
}

export async function fetchFreshWorks(overrides: FreshWorkOverride[]): Promise<FreshWorksData> {
  const items: FreshWorkItem[] = [];

  // For now, return empty - items will come from Firestore custom items
  // GitHub and App Store integration can be added later with env vars

  return {
    items,
    lastUpdated: new Date().toISOString(),
  };
}
