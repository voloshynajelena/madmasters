import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';
import Link from 'next/link';

export const metadata = {
  title: 'Services',
  description: 'Web development, online marketing, custom development and support services',
};

const services = [
  {
    id: 'web',
    title: 'Web Development',
    description: 'Professional website creation with modern technologies, responsive design, and optimal performance.',
    features: [
      'Landing pages',
      'Corporate websites',
      'E-commerce stores',
      'Custom web applications',
      'CMS integration',
    ],
    color: '#cea7bc',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'marketing',
    title: 'Online Marketing',
    description: 'Comprehensive digital marketing strategies to increase your online visibility and attract customers.',
    features: [
      'SEO optimization',
      'Google Ads campaigns',
      'Social media marketing',
      'Content marketing',
      'Analytics & reporting',
    ],
    color: '#f5deb3',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'custom',
    title: 'Custom Development',
    description: 'Tailored software solutions designed specifically for your business needs and workflows.',
    features: [
      'Custom CRM systems',
      'API development',
      'Database design',
      'Integration services',
      'Legacy system modernization',
    ],
    color: '#c0c0c0',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'support',
    title: 'Support & Maintenance',
    description: 'Ongoing technical support and maintenance to keep your digital presence running smoothly.',
    features: [
      'Website updates',
      'Security monitoring',
      'Performance optimization',
      'Backup management',
      '24/7 technical support',
    ],
    color: '#e8e8e8',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  const dict = getDictionary('en');

  return (
    <PageLayout locale="en" title="Our Services" subtitle="What we can do for you">
      <div className="py-16">
        <div className="container-section">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-5 sm:p-8 rounded-lg"
                style={{ backgroundColor: service.color }}
              >
                <div className="text-gray-700 mb-3 sm:mb-4 [&>svg]:w-10 [&>svg]:h-10 sm:[&>svg]:w-12 sm:[&>svg]:h-12">{service.icon}</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{service.title}</h2>
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">{service.description}</p>
                <ul className="space-y-1.5 sm:space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                      <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-accent text-white text-sm tracking-wider rounded-lg hover:bg-accent/90 transition-colors"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
