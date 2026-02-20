'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';

interface PortfolioProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  client: string;
  industry: string;
  year: number;
  services: string[];
  technologies: string[];
  liveUrl?: string;
  challenge?: string;
  solution?: string;
  results?: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export default function ProjectPageFr() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/portfolio?slug=${slug}`);
      const data = await res.json();

      if (!res.ok || !data.project) {
        setError(true);
        return;
      }

      setProject(data.project);
      setRelatedProjects(data.relatedProjects || []);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout locale="fr" title="Chargement..." subtitle="">
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !project) {
    notFound();
  }

  return (
    <PageLayout locale="fr" title={project.name} subtitle={project.description}>
      <div className="py-16">
        <div className="container-section">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-foreground/60">
              <li>
                <Link href="/fr" className="hover:text-accent transition-colors">
                  Accueil
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/fr/work" className="hover:text-accent transition-colors">
                  Réalisations
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{project.name}</li>
            </ol>
          </nav>

          {/* Hero Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 shadow-2xl">
            <img
              src={project.images[0] || project.thumbnail}
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Project Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 sm:space-y-12">
              {/* Overview */}
              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Aperçu</h2>
                <p className="text-foreground/70 leading-relaxed text-base sm:text-lg">
                  {project.fullDescription || project.description}
                </p>
              </section>

              {/* Challenge */}
              {project.challenge && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Le Défi</h2>
                  <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                    {project.challenge}
                  </p>
                </section>
              )}

              {/* Solution */}
              {project.solution && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Notre Solution</h2>
                  <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                    {project.solution}
                  </p>
                </section>
              )}

              {/* Results */}
              {project.results && project.results.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Résultats</h2>
                  <ul className="space-y-3">
                    {project.results.map((result, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-foreground/70"
                      >
                        <span className="text-accent text-xl">✓</span>
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Gallery */}
              {project.images.length > 1 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6">Galerie du Projet</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.images.slice(1).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <img
                          src={image}
                          alt={`${project.name} - Image ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Testimonial */}
              {project.testimonial && (
                <section className="bg-surface rounded-2xl p-5 sm:p-8">
                  <blockquote className="text-base sm:text-xl italic text-foreground/80 mb-3 sm:mb-4">
                    "{project.testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm sm:text-base">
                      {project.testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{project.testimonial.author}</div>
                      <div className="text-foreground/60 text-xs sm:text-sm">
                        {project.testimonial.role}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 sm:space-y-8">
              {/* Project Details */}
              <div className="bg-surface rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h3 className="font-bold text-base sm:text-lg border-b border-foreground/10 pb-2 sm:pb-3">
                  Détails du Projet
                </h3>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Client</div>
                  <div className="font-medium">{project.client}</div>
                </div>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Industrie</div>
                  <div className="font-medium">{project.industry}</div>
                </div>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Année</div>
                  <div className="font-medium">{project.year}</div>
                </div>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Catégorie</div>
                  <div className="font-medium capitalize">{project.category}</div>
                </div>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-accent text-white text-center rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    Visiter le Site →
                  </a>
                )}
              </div>

              {/* Services */}
              {project.services && project.services.length > 0 && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg border-b border-foreground/10 pb-2 sm:pb-3 mb-3 sm:mb-4">
                    Services Fournis
                  </h3>
                  <ul className="space-y-2">
                    {project.services.map((service) => (
                      <li
                        key={service}
                        className="flex items-center gap-2 text-foreground/70"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg border-b border-foreground/10 pb-2 sm:pb-3 mb-3 sm:mb-4">
                    Technologies Utilisées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="bg-surface rounded-2xl p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg border-b border-foreground/10 pb-2 sm:pb-3 mb-3 sm:mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-foreground/5 text-foreground/70 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-4 sm:p-6 text-center">
                <h3 className="font-bold text-base sm:text-lg mb-2">Vous aimez ce que vous voyez?</h3>
                <p className="text-foreground/60 text-xs sm:text-sm mb-3 sm:mb-4">
                  Discutons de votre projet et donnons vie à votre vision.
                </p>
                <Link
                  href="/fr/brief"
                  className="block w-full py-3 px-4 bg-accent text-white text-center rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Démarrer Votre Projet
                </Link>
              </div>
            </aside>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="mt-12 sm:mt-20">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center">
                Projets Similaires
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {relatedProjects.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/fr/work/${related.slug}`}
                    className="group relative aspect-[4/3] bg-surface overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500"
                  >
                    <img
                      src={related.thumbnail}
                      alt={related.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-lg">{related.name}</h3>
                      <p className="text-white/70 text-sm">{related.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Portfolio */}
          <div className="mt-16 text-center">
            <Link
              href="/fr/work"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              ← Retour aux Projets
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
