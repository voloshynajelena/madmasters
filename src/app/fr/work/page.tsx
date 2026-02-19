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

// Static fallback portfolio data
const staticProjects: PortfolioProject[] = [
  { id: '1', slug: 'orangeschool', name: 'Orange School', description: 'Site web du centre linguistique', category: 'web', tags: ['Éducation', 'Réservation'], thumbnail: '/content/img/portfolio/orangeschool.png', industry: 'Éducation' },
  { id: '2', slug: 'yudenko', name: 'Yudenko', description: 'Portfolio de designer créatif', category: 'web', tags: ['Portfolio', 'Créatif'], thumbnail: '/content/img/portfolio/yudenko.png', industry: 'Design' },
  { id: '3', slug: 'slimbeauty', name: 'Slim Beauty', description: 'Plateforme de réservation spa', category: 'web', tags: ['Bien-être', 'Réservation'], thumbnail: '/content/img/portfolio/slimbeauty.png', industry: 'Bien-être' },
  { id: '4', slug: 'dneprlaw', name: 'Dneprlaw', description: 'Site cabinet juridique', category: 'web', tags: ['Juridique', 'Corporate'], thumbnail: '/content/img/portfolio/dneprlaw.png', industry: 'Juridique' },
  { id: '5', slug: 'winplast', name: 'Winplast', description: 'Fabricant fenêtres et portes', category: 'web', tags: ['Industrie', 'B2B'], thumbnail: '/content/img/portfolio/winplast.png', industry: 'Industrie' },
  { id: '6', slug: 'macarons', name: 'Macarons', description: 'E-commerce pâtisserie artisanale', category: 'e-commerce', tags: ['Alimentation', 'E-commerce'], thumbnail: '/content/img/portfolio/macarons.png', industry: 'Alimentation' },
  { id: '7', slug: 'avocado', name: 'Avocado', description: 'Plateforme e-commerce alimentaire', category: 'e-commerce', tags: ['Bio', 'Abonnement'], thumbnail: '/content/img/portfolio/avocado.png', industry: 'Alimentation' },
  { id: '8', slug: 'teplogarant', name: 'Teplogarant', description: 'Entreprise systèmes de chauffage', category: 'web', tags: ['Industriel', 'B2B'], thumbnail: '/content/img/portfolio/teplogarant.png', industry: 'HVAC' },
  { id: '9', slug: 'photovis', name: 'Photovis', description: 'Site studio photo', category: 'web', tags: ['Photographie', 'Portfolio'], thumbnail: '/content/img/portfolio/photovis.png', industry: 'Photographie' },
  { id: '10', slug: 'atlantika', name: 'Atlantika', description: 'Plateforme agence de voyage', category: 'e-commerce', tags: ['Voyage', 'Réservation'], thumbnail: '/content/img/portfolio/portfolio-atlantika.png', industry: 'Voyage' },
  { id: '11', slug: 'best-pc', name: 'Best PC', description: 'Magasin informatique', category: 'e-commerce', tags: ['Électronique', 'E-commerce'], thumbnail: '/content/img/portfolio/best-pc.png', industry: 'Commerce' },
  { id: '12', slug: 'btech', name: 'B-Tech', description: 'Cabinet conseil technologique', category: 'web', tags: ['Technologie', 'B2B'], thumbnail: '/content/img/portfolio/btech.png', industry: 'Technologie' },
];

export default function WorkPageFr() {
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
      if (res.ok && data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      } else {
        setProjects(staticProjects);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      setProjects(staticProjects);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <PageLayout locale="fr" title="Portfolio" subtitle="Nos projets réalisés">
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
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                }`}
              >
                {cat.labelFr}
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
              {/* Projects Grid - Fresh Works Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/fr/work/${project.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Category badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg bg-accent text-white">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-accent transition-colors mb-2">
                        {project.name}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {project.description}
                      </p>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
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
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {project.industry}
                        </span>
                        <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Voir le projet
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-foreground/60">Aucun projet trouvé dans cette catégorie.</p>
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="mt-4 text-accent hover:underline"
                  >
                    Voir tous les projets
                  </button>
                </div>
              )}
            </>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">{projects.length}+</div>
              <div className="text-foreground/60 text-sm">Projets Réalisés</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">50+</div>
              <div className="text-foreground/60 text-sm">Clients Satisfaits</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">10+</div>
              <div className="text-foreground/60 text-sm">Années d'Expérience</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-xl">
              <div className="text-3xl font-bold text-accent mb-1">100%</div>
              <div className="text-foreground/60 text-sm">Satisfaction Client</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
