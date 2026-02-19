'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';
import { categories, type PortfolioCategory } from '@/data/portfolio';

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

export default function WorkPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <PageLayout locale="en" title="Our Work" subtitle="Portfolio of completed projects">
      <div className="py-16">
        <div className="container-section">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'bg-white/10 text-foreground/70 hover:bg-white/20 hover:text-foreground'
                }`}
              >
                {cat.label}
                {cat.id !== 'all' && (
                  <span className="ml-2 text-xs opacity-60">
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
              {/* Projects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/work/${project.slug}`}
                    className="group relative aspect-[4/3] bg-surface overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500"
                  >
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-accent text-xs uppercase tracking-wider font-medium mb-2">
                        {project.category}
                      </span>
                      <h3 className="text-white font-bold text-xl mb-1">{project.name}</h3>
                      <p className="text-white/70 text-sm line-clamp-2">{project.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Always visible label */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="text-white font-semibold">{project.name}</h3>
                      <p className="text-white/60 text-sm">{project.industry}</p>
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
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">{projects.length}+</div>
              <div className="text-foreground/60 text-sm">Projects Completed</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">50+</div>
              <div className="text-foreground/60 text-sm">Happy Clients</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">10+</div>
              <div className="text-foreground/60 text-sm">Years Experience</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">100%</div>
              <div className="text-foreground/60 text-sm">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
