import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';
import Link from 'next/link';

export const metadata = {
  title: 'Services',
  description: 'Développement web, marketing en ligne, développement sur mesure et services de support',
};

export default function ServicesPage() {
  const dict = getDictionary('fr');

  const services = [
    { id: 'web', title: 'Développement Web', color: '#cea7bc' },
    { id: 'marketing', title: 'Marketing en ligne', color: '#f5deb3' },
    { id: 'custom', title: 'Développement sur mesure', color: '#c0c0c0' },
    { id: 'support', title: 'Support et maintenance', color: '#e8e8e8' },
  ];

  return (
    <PageLayout locale="fr" title="Nos Services" subtitle="Ce que nous pouvons faire pour vous">
      <div className="py-16">
        <div className="container-section">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div key={service.id} className="p-8 rounded-lg" style={{ backgroundColor: service.color }}>
                <h2 className="text-2xl font-bold text-primary mb-4">{service.title}</h2>
                <p className="text-primary/70">{dict.services[service.id as keyof typeof dict.services]?.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/fr/contact" className="inline-block px-8 py-4 bg-primary text-white text-sm tracking-wider hover:bg-primary-light transition-colors">
              Demander un devis
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
