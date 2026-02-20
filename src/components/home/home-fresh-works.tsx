'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PortfolioItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail?: string;
  tags?: string[];
  category?: string; // Legacy single category
  categories?: string[]; // New multi-select categories
  industry?: string;
  showOnHomepage?: boolean;
}

// Helper to get first category (for display)
function getFirstCategory(item: PortfolioItem): string {
  if (item.categories && item.categories.length > 0) {
    return item.categories[0];
  }
  return item.category || 'web';
}

interface HomeFreshWorksProps {
  locale: 'en' | 'fr';
  maxItems?: number;
}

// Static fallback items
const staticItems: PortfolioItem[] = [
  { id: '1', slug: 'orangeschool', name: 'Orange School', description: 'Linguistic center website with online booking', thumbnail: '/content/img/portfolio/orangeschool.png', tags: ['Education', 'Booking'], category: 'web', industry: 'Education' },
  { id: '2', slug: 'yudenko', name: 'Yudenko', description: 'Designer portfolio showcasing creative work', thumbnail: '/content/img/portfolio/yudenko.png', tags: ['Portfolio', 'Creative'], category: 'web', industry: 'Design' },
  { id: '3', slug: 'slimbeauty', name: 'Slim Beauty', description: 'Massage salon booking platform', thumbnail: '/content/img/portfolio/slimbeauty.png', tags: ['Wellness', 'Booking'], category: 'web', industry: 'Wellness' },
  { id: '4', slug: 'dneprlaw', name: 'Dneprlaw', description: 'Legal services firm website', thumbnail: '/content/img/portfolio/dneprlaw.png', tags: ['Legal', 'Corporate'], category: 'web', industry: 'Legal' },
  { id: '5', slug: 'winplast', name: 'Winplast', description: 'Windows & doors manufacturer', thumbnail: '/content/img/portfolio/winplast.png', tags: ['Manufacturing', 'B2B'], category: 'web', industry: 'Manufacturing' },
  { id: '6', slug: 'macarons', name: 'Macarons', description: 'Artisan bakery e-commerce', thumbnail: '/content/img/portfolio/macarons.png', tags: ['Food', 'E-commerce'], category: 'e-commerce', industry: 'Food & Beverage' },
];

// Helper to generate slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export function HomeFreshWorks({ locale, maxItems = 6 }: HomeFreshWorksProps) {
  const [items, setItems] = useState<PortfolioItem[]>(staticItems);
  const [loading, setLoading] = useState(true);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/portfolio');
        const json = await res.json();
        if (json.projects && json.projects.length > 0) {
          // Prefer items marked for homepage, then first items by order
          const homepageItems = json.projects.filter((item: PortfolioItem) => item.showOnHomepage);
          const otherItems = json.projects.filter((item: PortfolioItem) => !item.showOnHomepage);

          const sortedItems = [...homepageItems, ...otherItems].slice(0, maxItems);
          if (sortedItems.length > 0) {
            setItems(sortedItems);
          }
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [maxItems]);

  const displayItems = items.slice(0, maxItems);

  const categoryLabels: Record<string, string> = {
    web: 'Web',
    'e-commerce': 'E-Commerce',
    mobile: 'Mobile',
    branding: 'Branding',
    marketing: 'Marketing',
  };

  return (
    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-6 max-w-5xl mx-auto">
      {displayItems.map((item, index) => {
        const slug = item.slug || generateSlug(item.name);
        const href = `${prefix}/work/${slug}`;

        return (
          <Link
            key={item.id || index}
            href={href}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-row sm:flex-col"
          >
            {/* Thumbnail */}
            <div className="relative w-1/3 min-w-[120px] sm:w-full h-auto sm:h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-orange-600">
                  <span className="text-white/80 text-4xl font-bold">{item.name.charAt(0)}</span>
                </div>
              )}
              {/* Category badge - hidden on mobile */}
              <div className="hidden sm:block absolute bottom-4 left-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg bg-accent text-white">
                  {categoryLabels[getFirstCategory(item)] || 'Web'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center sm:justify-start">
              {/* Category badge - mobile only */}
              <span className="sm:hidden px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-accent text-white self-start mb-2">
                {categoryLabels[getFirstCategory(item)] || 'Web'}
              </span>

              <h3 className="font-bold text-base sm:text-xl text-gray-900 group-hover:text-accent transition-colors mb-1 sm:mb-2">
                {item.name}
              </h3>

              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4">
                {item.description}
              </p>

              {/* Tags - hidden on mobile */}
              {item.tags && item.tags.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-2 mb-4">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* View link - desktop */}
              <div className="hidden sm:flex pt-4 border-t border-gray-100 items-center justify-between">
                <span className="text-sm text-gray-400">
                  {item.industry || categoryLabels[getFirstCategory(item)] || 'Web'}
                </span>
                <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Project
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>

              {/* View link - mobile */}
              <span className="sm:hidden text-accent font-medium text-xs flex items-center gap-1 mt-auto">
                View
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
