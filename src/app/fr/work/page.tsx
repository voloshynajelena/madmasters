import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

export const metadata = {
  title: 'Portfolio',
  description: 'Explorez notre portfolio de développement web et design',
};

const projects = [
  { name: 'Orangeschool', desc: 'Centre linguistique', img: '/content/img/portfolio/orangeschool.png' },
  { name: 'Yudenko', desc: 'Portfolio designer', img: '/content/img/portfolio/yudenko.png' },
  { name: 'Slim Beauty', desc: 'Salon de massage', img: '/content/img/portfolio/slimbeauty.png' },
  { name: 'Dneprlaw', desc: 'Services juridiques', img: '/content/img/portfolio/dneprlaw.png' },
];

export default function WorkPage() {
  const dict = getDictionary('fr');

  return (
    <PageLayout locale="fr" title="Notre travail" subtitle="Portfolio de projets réalisés">
      <div className="py-16">
        <div className="container-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project, index) => (
              <div key={index} className="group relative aspect-square bg-primary/10 overflow-hidden cursor-pointer rounded-lg">
                <img src={project.img} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <h3 className="text-white font-bold">{project.name}</h3>
                  <p className="text-white/70 text-sm">{project.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
