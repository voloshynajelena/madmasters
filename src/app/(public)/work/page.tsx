'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';
import { categories, type PortfolioCategory } from '@/data/portfolio';
import { useContent } from '@/hooks/use-content';

interface PortfolioProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  industry: string;
}

// Static fallback portfolio data
const staticProjects: PortfolioProject[] = [
  { id: '1', slug: 'orangeschool', name: 'Orange School', description: 'Linguistic center website with online booking', category: 'web', tags: ['Education', 'Booking'], thumbnail: '/content/img/portfolio/orangeschool.png', industry: 'Education' },
  { id: '2', slug: 'yudenko', name: 'Yudenko', description: 'Designer portfolio showcasing creative work', category: 'web', tags: ['Portfolio', 'Creative'], thumbnail: '/content/img/portfolio/yudenko.png', industry: 'Design' },
  { id: '3', slug: 'slimbeauty', name: 'Slim Beauty', description: 'Massage salon booking platform', category: 'web', tags: ['Wellness', 'Booking'], thumbnail: '/content/img/portfolio/slimbeauty.png', industry: 'Wellness' },
  { id: '4', slug: 'dneprlaw', name: 'Dneprlaw', description: 'Legal services firm website', category: 'web', tags: ['Legal', 'Corporate'], thumbnail: '/content/img/portfolio/dneprlaw.png', industry: 'Legal' },
  { id: '5', slug: 'winplast', name: 'Winplast', description: 'Windows & doors manufacturer', category: 'web', tags: ['Manufacturing', 'B2B'], thumbnail: '/content/img/portfolio/winplast.png', industry: 'Manufacturing' },
  { id: '6', slug: 'macarons', name: 'Macarons', description: 'Artisan bakery e-commerce', category: 'e-commerce', tags: ['Food', 'E-commerce'], thumbnail: '/content/img/portfolio/macarons.png', industry: 'Food & Beverage' },
  { id: '7', slug: 'avocado', name: 'Avocado', description: 'Health food e-commerce platform', category: 'e-commerce', tags: ['Health Food', 'Subscription'], thumbnail: '/content/img/portfolio/avocado.png', industry: 'Food & Beverage' },
  { id: '8', slug: 'teplogarant', name: 'Teplogarant', description: 'Heating systems company', category: 'web', tags: ['Industrial', 'B2B'], thumbnail: '/content/img/portfolio/teplogarant.png', industry: 'HVAC' },
  { id: '9', slug: 'photovis', name: 'Photovis', description: 'Photography studio website', category: 'web', tags: ['Photography', 'Portfolio'], thumbnail: '/content/img/portfolio/photovis.png', industry: 'Photography' },
  { id: '10', slug: 'atlantika', name: 'Atlantika', description: 'Travel agency booking platform', category: 'e-commerce', tags: ['Travel', 'Booking'], thumbnail: '/content/img/portfolio/portfolio-atlantika.png', industry: 'Travel' },
  { id: '11', slug: 'best-pc', name: 'Best PC', description: 'Computer hardware store', category: 'e-commerce', tags: ['Electronics', 'E-commerce'], thumbnail: '/content/img/portfolio/best-pc.png', industry: 'Retail' },
  { id: '12', slug: 'btech', name: 'B-Tech', description: 'Technology consulting firm', category: 'web', tags: ['Technology', 'B2B'], thumbnail: '/content/img/portfolio/btech.png', industry: 'Technology' },
];

export default function WorkPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('all');
  const { get } = useContent({ page: 'work', locale: 'en' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (res.ok && data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      } else {
        // Use static fallback data
        setProjects(staticProjects);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      // Use static fallback data on error
      setProjects(staticProjects);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <PageLayout
      locale="en"
      title={get('header.title', 'Portfolio')}
      subtitle={get('header.subtitle', 'Our completed projects')}
    >
      <div className="py-16">
        <div className="container-section">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12 px-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                }`}
              >
                {cat.label}
                {cat.id !== 'all' && (
                  <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-60">
                    ({projects.filter(p => p.category === cat.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              {/* Projects Grid - Horizontal on mobile, vertical cards on larger screens */}
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/work/${project.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-row sm:flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-1/3 min-w-[120px] sm:w-full h-auto sm:h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Category badge - hidden on mobile, visible on sm+ */}
                      <div className="hidden sm:block absolute bottom-4 left-4">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg bg-accent text-white">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center sm:justify-start">
                      {/* Category badge - visible on mobile only */}
                      <span className="sm:hidden px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-accent text-white self-start mb-2">
                        {project.category}
                      </span>

                      <h3 className="font-bold text-base sm:text-xl text-gray-900 group-hover:text-accent transition-colors mb-1 sm:mb-2">
                        {project.name}
                      </h3>

                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4">
                        {project.description}
                      </p>

                      {/* Tags - hidden on mobile */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-2 mb-4">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* View link */}
                      <div className="hidden sm:flex pt-4 border-t border-gray-100 items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {project.industry}
                        </span>
                        <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Project
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>

                      {/* Mobile view link */}
                      <span className="sm:hidden text-accent font-medium text-xs flex items-center gap-1 mt-auto">
                        View
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-foreground/60">No projects found in this category.</p>
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="mt-4 text-accent hover:underline"
                  >
                    View all projects
                  </button>
                </div>
              )}
            </>
          )}

          {/* Stats */}
          <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-surface rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">{projects.length}+</div>
              <div className="text-foreground/60 text-xs sm:text-sm">Projects Completed</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-surface rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">{get('stats.clients_value', '50+')}</div>
              <div className="text-foreground/60 text-xs sm:text-sm">{get('stats.clients_label', 'Happy Clients')}</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-surface rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">{get('stats.years_value', '10+')}</div>
              <div className="text-foreground/60 text-xs sm:text-sm">{get('stats.years_label', 'Years Experience')}</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-surface rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">{get('stats.satisfaction_value', '100%')}</div>
              <div className="text-foreground/60 text-xs sm:text-sm">{get('stats.satisfaction_label', 'Client Satisfaction')}</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
