import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

export const metadata = {
  title: 'À propos',
  description: 'En savoir plus sur Mad Masters - une équipe créative de développement web',
};

export default function AboutPage() {
  const dict = getDictionary('fr');

  return (
    <PageLayout locale="fr" title="À propos de Mad Masters" subtitle="Studio Web">
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Qui sommes-nous</h2>
                <p className="text-gray-700 mb-4">
                  Mad Masters est une équipe de professionnels orientée client. Utilisant des
                  technologies modernes, la responsabilité, l'exécution précise des tâches,
                  l'efficacité maximale et un design réfléchi - c'est Mad Masters.
                </p>
                <p className="text-gray-700 mb-4">
                  Nous incarnons magistralement vos idées et souhaits, car nous mettons toute
                  notre expérience et nos connaissances dans chaque projet.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Nos valeurs</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Qualité d'abord</h3>
                      <p className="text-gray-600 text-sm">Chaque projet respecte les normes W3C et Google</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Vitesse et performance</h3>
                      <p className="text-gray-600 text-sm">Optimisé pour Google PageSpeed</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
