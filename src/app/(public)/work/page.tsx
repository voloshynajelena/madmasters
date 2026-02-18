'use client';

import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

const projects = [
  { name: 'Orangeschool', desc: 'Linguistic center', img: '/content/img/portfolio/orangeschool.png', category: 'Web' },
  { name: 'Yudenko', desc: 'Designer portfolio', img: '/content/img/portfolio/yudenko.png', category: 'Web' },
  { name: 'Slim Beauty', desc: 'Massage salon', img: '/content/img/portfolio/slimbeauty.png', category: 'Web' },
  { name: 'Dneprlaw', desc: 'Legal services', img: '/content/img/portfolio/dneprlaw.png', category: 'Web' },
  { name: 'Winplast', desc: 'Windows & doors', img: '/content/img/portfolio/winplast.png', category: 'Web' },
  { name: 'Macarons', desc: 'Bakery', img: '/content/img/portfolio/macarons.png', category: 'Web' },
  { name: 'Avocado', desc: 'E-commerce', img: '/content/img/portfolio/avocado.png', category: 'E-commerce' },
  { name: 'Teplogarant', desc: 'Heating systems', img: '/content/img/portfolio/teplogarant.png', category: 'Web' },
  { name: 'Photovis', desc: 'Photography', img: '/content/img/portfolio/photovis.png', category: 'Web' },
  { name: 'PC-ZP', desc: 'Computer services', img: '/content/img/portfolio/pc-zp1.png', category: 'Web' },
  { name: 'Stroy Group', desc: 'Construction', img: '/content/img/portfolio/stroy-group.png', category: 'Web' },
  { name: 'Atlantika', desc: 'Travel agency', img: '/content/img/portfolio/portfolio-atlantika.png', category: 'Web' },
];

export default function WorkPage() {
  const dict = getDictionary('en');

  return (
    <PageLayout locale="en" title="Our Work" subtitle="Portfolio of completed projects">
      <div className="py-16">
        <div className="container-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group relative aspect-square bg-primary/10 overflow-hidden cursor-pointer rounded-lg"
              >
                <img
                  src={project.img}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-6">
                  <span className="text-white/60 text-xs uppercase tracking-wider mb-1">
                    {project.category}
                  </span>
                  <h3 className="text-white font-bold text-lg">{project.name}</h3>
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
