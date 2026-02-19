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

export default function ProjectPage() {
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
      <PageLayout locale="en" title="Loading..." subtitle="">
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
    <PageLayout locale="en" title={project.name} subtitle={project.description}>
      <div className="py-16">
        <div className="container-section">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-foreground/60">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/work" className="hover:text-accent transition-colors">
                  Work
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-foreground/70 leading-relaxed text-lg">
                  {project.fullDescription || project.description}
                </p>
              </section>

              {/* Challenge */}
              {project.challenge && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    {project.challenge}
                  </p>
                </section>
              )}

              {/* Solution */}
              {project.solution && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Our Solution</h2>
                  <p className="text-foreground/70 leading-relaxed">
                    {project.solution}
                  </p>
                </section>
              )}

              {/* Results */}
              {project.results && project.results.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
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
                  <h2 className="text-2xl font-bold mb-6">Project Gallery</h2>
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
                <section className="bg-surface rounded-2xl p-8">
                  <blockquote className="text-xl italic text-foreground/80 mb-4">
                    "{project.testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      {project.testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{project.testimonial.author}</div>
                      <div className="text-foreground/60 text-sm">
                        {project.testimonial.role}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Project Details */}
              <div className="bg-surface rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-foreground/10 pb-3">
                  Project Details
                </h3>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Client</div>
                  <div className="font-medium">{project.client}</div>
                </div>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Industry</div>
                  <div className="font-medium">{project.industry}</div>
                </div>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Year</div>
                  <div className="font-medium">{project.year}</div>
                </div>

                <div>
                  <div className="text-foreground/60 text-sm mb-1">Category</div>
                  <div className="font-medium capitalize">{project.category}</div>
                </div>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-accent text-white text-center rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    Visit Live Site →
                  </a>
                )}
              </div>

              {/* Services */}
              {project.services && project.services.length > 0 && (
                <div className="bg-surface rounded-2xl p-6">
                  <h3 className="font-bold text-lg border-b border-foreground/10 pb-3 mb-4">
                    Services Provided
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
                <div className="bg-surface rounded-2xl p-6">
                  <h3 className="font-bold text-lg border-b border-foreground/10 pb-3 mb-4">
                    Technologies Used
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
                <div className="bg-surface rounded-2xl p-6">
                  <h3 className="font-bold text-lg border-b border-foreground/10 pb-3 mb-4">
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
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 text-center">
                <h3 className="font-bold text-lg mb-2">Like what you see?</h3>
                <p className="text-foreground/60 text-sm mb-4">
                  Let's discuss your project and bring your vision to life.
                </p>
                <Link
                  href="/brief"
                  className="block w-full py-3 px-4 bg-accent text-white text-center rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Start Your Project
                </Link>
              </div>
            </aside>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl font-bold mb-8 text-center">
                Related Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/work/${related.slug}`}
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
              href="/work"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              ← Back to All Projects
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
