export type PortfolioCategory = 'all' | 'web' | 'e-commerce' | 'branding' | 'marketing' | 'mobile';

export interface PortfolioProject {
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: PortfolioCategory;
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

export const categories: { id: PortfolioCategory; label: string; labelFr: string }[] = [
  { id: 'all', label: 'All Projects', labelFr: 'Tous les projets' },
  { id: 'web', label: 'Web Development', labelFr: 'Développement Web' },
  { id: 'e-commerce', label: 'E-Commerce', labelFr: 'E-Commerce' },
  { id: 'branding', label: 'Branding', labelFr: 'Image de marque' },
  { id: 'marketing', label: 'Marketing', labelFr: 'Marketing' },
  { id: 'mobile', label: 'Mobile Apps', labelFr: 'Applications mobiles' },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'orangeschool',
    name: 'Orange School',
    description: 'Linguistic center website with online booking',
    fullDescription: 'A modern website for a linguistic center featuring course catalogs, teacher profiles, online booking system, and student portal.',
    category: 'web',
    tags: ['Education', 'Booking System', 'Multilingual'],
    thumbnail: '/content/img/portfolio/orangeschool.png',
    images: [
      '/content/img/portfolio/orangeschool.png',
      '/content/img/portfolio/orange.png',
      '/content/img/portfolio/oranges.png',
    ],
    client: 'Orange School',
    industry: 'Education',
    year: 2023,
    services: ['Web Design', 'Development', 'SEO'],
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    liveUrl: 'https://orangeschool.com.ua',
    challenge: 'Create an engaging platform that simplifies course discovery and enrollment while showcasing the school\'s unique teaching methodology.',
    solution: 'We developed a custom booking system with real-time availability, integrated payment processing, and a student dashboard for tracking progress.',
    results: ['150% increase in online enrollments', '40% reduction in administrative workload', '4.8/5 average user rating'],
  },
  {
    slug: 'yudenko',
    name: 'Yudenko',
    description: 'Designer portfolio showcasing creative work',
    fullDescription: 'A stunning portfolio website for a talented designer, featuring smooth animations, gallery views, and project case studies.',
    category: 'web',
    tags: ['Portfolio', 'Creative', 'Animation'],
    thumbnail: '/content/img/portfolio/yudenko.png',
    images: [
      '/content/img/portfolio/yudenko.png',
      '/content/img/portfolio/yudenko-1.png',
      '/content/img/portfolio/yudenko-2.png',
      '/content/img/portfolio/yudenko-3.png',
      '/content/img/portfolio/yudenko-4.png',
      '/content/img/portfolio/yudenko-5.png',
      '/content/img/portfolio/yudenko-6.png',
    ],
    client: 'Anna Yudenko',
    industry: 'Design',
    year: 2023,
    services: ['Web Design', 'Development', 'Branding'],
    technologies: ['Next.js', 'GSAP', 'Tailwind CSS'],
    challenge: 'Design a portfolio that stands out in the competitive design industry while maintaining fast load times despite heavy imagery.',
    solution: 'Implemented lazy loading, WebP image optimization, and custom GSAP animations that enhance rather than hinder the user experience.',
    results: ['Featured on Awwwards', '2.5s average page load', '300% increase in client inquiries'],
  },
  {
    slug: 'slimbeauty',
    name: 'Slim Beauty',
    description: 'Massage salon booking platform',
    fullDescription: 'A wellness-focused website for a massage salon featuring service descriptions, therapist profiles, and an integrated booking system.',
    category: 'web',
    tags: ['Wellness', 'Booking', 'Local Business'],
    thumbnail: '/content/img/portfolio/slimbeauty.png',
    images: [
      '/content/img/portfolio/slimbeauty.png',
      '/content/img/portfolio/massage1.png',
      '/content/img/portfolio/massage2.png',
    ],
    client: 'Slim Beauty Spa',
    industry: 'Wellness',
    year: 2022,
    services: ['Web Design', 'Development', 'Local SEO'],
    technologies: ['WordPress', 'WooCommerce', 'Booking Plugin'],
    liveUrl: 'https://slimbeauty.ua',
    challenge: 'Create a calming digital experience that converts visitors into bookings while managing therapist schedules efficiently.',
    solution: 'Built a custom booking system with automated reminders, gift card functionality, and integration with Google Business.',
    results: ['80% of bookings now online', 'No-show rate reduced by 60%', 'Top 3 Google ranking for local keywords'],
  },
  {
    slug: 'dneprlaw',
    name: 'Dneprlaw',
    description: 'Legal services firm website',
    fullDescription: 'A professional website for a law firm featuring practice areas, attorney profiles, case results, and client testimonials.',
    category: 'web',
    tags: ['Legal', 'Professional Services', 'Corporate'],
    thumbnail: '/content/img/portfolio/dneprlaw.png',
    images: [
      '/content/img/portfolio/dneprlaw.png',
      '/content/img/portfolio/dneprlaw-1.png',
      '/content/img/portfolio/dneprlaw2.png',
    ],
    client: 'Dneprlaw Associates',
    industry: 'Legal',
    year: 2022,
    services: ['Web Design', 'Development', 'Content Strategy'],
    technologies: ['Next.js', 'Sanity CMS', 'Tailwind CSS'],
    challenge: 'Build trust and credibility online while making legal services approachable and easy to understand.',
    solution: 'Created detailed practice area pages with FAQs, integrated a secure client portal, and implemented live chat for immediate assistance.',
    results: ['200% increase in consultation requests', '45% reduction in phone inquiries', 'Featured in Legal Tech Magazine'],
  },
  {
    slug: 'winplast',
    name: 'Winplast',
    description: 'Windows & doors manufacturer',
    fullDescription: 'A product-focused website for a windows and doors manufacturer with configurator, quote calculator, and dealer locator.',
    category: 'web',
    tags: ['Manufacturing', 'B2B', 'Product Catalog'],
    thumbnail: '/content/img/portfolio/winplast.png',
    images: [
      '/content/img/portfolio/winplast.png',
    ],
    client: 'Winplast LLC',
    industry: 'Manufacturing',
    year: 2022,
    services: ['Web Design', 'Development', 'Product Photography'],
    technologies: ['React', 'Three.js', 'Node.js'],
    challenge: 'Help customers visualize custom window and door configurations before purchasing.',
    solution: 'Developed a 3D product configurator allowing customers to customize dimensions, colors, and materials with real-time pricing.',
    results: ['Quote requests up 180%', 'Average order value increased 35%', 'Dealer network expanded by 40%'],
  },
  {
    slug: 'macarons',
    name: 'Macarons',
    description: 'Artisan bakery e-commerce',
    fullDescription: 'A delicious e-commerce website for an artisan bakery specializing in French macarons with online ordering and delivery.',
    category: 'e-commerce',
    tags: ['Food & Beverage', 'E-commerce', 'Local Delivery'],
    thumbnail: '/content/img/portfolio/macarons.png',
    images: [
      '/content/img/portfolio/macarons.png',
      '/content/img/portfolio/macarone1.png',
    ],
    client: 'Macarons Boutique',
    industry: 'Food & Beverage',
    year: 2023,
    services: ['E-commerce Development', 'Branding', 'Photography'],
    technologies: ['Shopify', 'Custom Theme', 'Klaviyo'],
    challenge: 'Translate the artisanal quality and beauty of handmade macarons into a compelling online shopping experience.',
    solution: 'Created a visually stunning store with high-quality product photography, gift box builder, and subscription options.',
    results: ['Online sales now 60% of revenue', '25% of customers subscribe', 'Featured in Food & Wine Magazine'],
  },
  {
    slug: 'avocado',
    name: 'Avocado',
    description: 'Health food e-commerce platform',
    fullDescription: 'A comprehensive e-commerce platform for organic and health food products with subscription boxes and recipe integration.',
    category: 'e-commerce',
    tags: ['Health Food', 'Subscription', 'Organic'],
    thumbnail: '/content/img/portfolio/avocado.png',
    images: [
      '/content/img/portfolio/avocado.png',
      '/content/img/portfolio/avokado.png',
    ],
    client: 'Avocado Foods',
    industry: 'Food & Beverage',
    year: 2023,
    services: ['E-commerce Development', 'UX Design', 'Marketing'],
    technologies: ['WooCommerce', 'React', 'Stripe'],
    liveUrl: 'https://avocadofoods.ua',
    challenge: 'Create an engaging shopping experience that educates customers about health benefits while driving conversions.',
    solution: 'Integrated recipe suggestions with products, built subscription box customization, and implemented a rewards program.',
    results: ['Average order value increased 45%', 'Customer retention up 60%', '10,000+ newsletter subscribers'],
  },
  {
    slug: 'teplogarant',
    name: 'Teplogarant',
    description: 'Heating systems company',
    fullDescription: 'A technical website for a heating systems company featuring product catalog, installation calculator, and service booking.',
    category: 'web',
    tags: ['Industrial', 'B2B', 'Technical'],
    thumbnail: '/content/img/portfolio/teplogarant.png',
    images: [
      '/content/img/portfolio/teplogarant.png',
    ],
    client: 'Teplogarant',
    industry: 'HVAC',
    year: 2022,
    services: ['Web Design', 'Development', 'Technical SEO'],
    technologies: ['WordPress', 'Custom Plugins', 'React Calculator'],
    challenge: 'Present complex technical products in an understandable way while generating qualified B2B leads.',
    solution: 'Created interactive calculators for heating requirements, detailed product comparisons, and a quote request system.',
    results: ['Lead quality improved 70%', 'Website now primary sales channel', 'Ranked #1 for 50+ industry keywords'],
  },
  {
    slug: 'photovis',
    name: 'Photovis',
    description: 'Photography studio website',
    fullDescription: 'A visual-first portfolio website for a photography studio showcasing wedding, portrait, and commercial work.',
    category: 'web',
    tags: ['Photography', 'Portfolio', 'Creative'],
    thumbnail: '/content/img/portfolio/photovis.png',
    images: [
      '/content/img/portfolio/photovis.png',
    ],
    client: 'Photovis Studio',
    industry: 'Photography',
    year: 2022,
    services: ['Web Design', 'Development', 'Gallery System'],
    technologies: ['Next.js', 'Cloudinary', 'Framer Motion'],
    challenge: 'Create a fast-loading gallery website that showcases thousands of high-resolution images.',
    solution: 'Implemented advanced image optimization with Cloudinary, infinite scroll galleries, and client proofing system.',
    results: ['Page load under 2 seconds', 'Client bookings up 90%', 'Featured on Design Inspiration sites'],
  },
  {
    slug: 'pc-zp',
    name: 'PC-ZP',
    description: 'Computer services & repair',
    fullDescription: 'A service-focused website for a computer repair and IT services company with online diagnostics and booking.',
    category: 'web',
    tags: ['IT Services', 'Local Business', 'Support'],
    thumbnail: '/content/img/portfolio/pc-zp1.png',
    images: [
      '/content/img/portfolio/pc-zp1.png',
      '/content/img/portfolio/pc-zp2.png',
      '/content/img/portfolio/pc-zp3.png',
      '/content/img/portfolio/pc-zp4.png',
    ],
    client: 'PC-ZP',
    industry: 'IT Services',
    year: 2021,
    services: ['Web Design', 'Development', 'Local SEO'],
    technologies: ['WordPress', 'Custom Theme', 'Booking System'],
    challenge: 'Convert website visitors into service bookings while reducing phone support load.',
    solution: 'Built an online diagnostic tool, transparent pricing calculator, and live chat support.',
    results: ['70% of bookings now online', 'Support calls reduced 50%', 'Google Maps reviews up 200%'],
  },
  {
    slug: 'stroy-group',
    name: 'Stroy Group',
    description: 'Construction company website',
    fullDescription: 'A professional website for a construction company featuring project portfolio, services, and quote request system.',
    category: 'web',
    tags: ['Construction', 'B2B', 'Portfolio'],
    thumbnail: '/content/img/portfolio/stroy-group.png',
    images: [
      '/content/img/portfolio/stroy-group.png',
    ],
    client: 'Stroy Group',
    industry: 'Construction',
    year: 2021,
    services: ['Web Design', 'Development', 'Photography'],
    technologies: ['WordPress', 'Elementor', 'Custom Plugins'],
    challenge: 'Showcase completed projects to win larger commercial contracts.',
    solution: 'Created detailed project case studies with before/after galleries, timeline visualizations, and client testimonials.',
    results: ['Won 3 major contracts via website', 'Average project value up 150%', 'Industry award for web presence'],
  },
  {
    slug: 'atlantika',
    name: 'Atlantika',
    description: 'Travel agency booking platform',
    fullDescription: 'A full-featured travel agency website with tour packages, booking system, and travel blog.',
    category: 'e-commerce',
    tags: ['Travel', 'Booking', 'Tourism'],
    thumbnail: '/content/img/portfolio/portfolio-atlantika.png',
    images: [
      '/content/img/portfolio/portfolio-atlantika.png',
    ],
    client: 'Atlantika Travel',
    industry: 'Travel & Tourism',
    year: 2021,
    services: ['Web Design', 'Development', 'Content Marketing'],
    technologies: ['Laravel', 'Vue.js', 'MySQL'],
    challenge: 'Compete with large online travel agencies while maintaining personal service.',
    solution: 'Built a custom booking system with package customization, travel guides, and loyalty program.',
    results: ['Online bookings increased 300%', 'Customer retention up 45%', 'Expanded to 3 new destinations'],
  },
  {
    slug: 'best-pc',
    name: 'Best PC',
    description: 'Computer hardware store',
    fullDescription: 'An e-commerce website for a computer hardware retailer with product comparison and PC builder tools.',
    category: 'e-commerce',
    tags: ['Electronics', 'E-commerce', 'Tech'],
    thumbnail: '/content/img/portfolio/best-pc.png',
    images: [
      '/content/img/portfolio/best-pc.png',
    ],
    client: 'Best PC Store',
    industry: 'Retail',
    year: 2022,
    services: ['E-commerce Development', 'UX Design', 'Integration'],
    technologies: ['WooCommerce', 'React', 'Custom API'],
    challenge: 'Help customers build compatible PC configurations while competing on price.',
    solution: 'Created a PC builder tool with compatibility checking, price comparison, and wishlist features.',
    results: ['Conversion rate up 40%', 'Returns reduced 60%', 'Average order value up 25%'],
  },
  {
    slug: 'bitovyxa',
    name: 'Bitovyxa',
    description: 'Home appliances store',
    fullDescription: 'A modern e-commerce platform for home appliances with delivery tracking and installation services.',
    category: 'e-commerce',
    tags: ['Home Appliances', 'E-commerce', 'Delivery'],
    thumbnail: '/content/img/portfolio/bitovyxa.png',
    images: [
      '/content/img/portfolio/bitovyxa.png',
    ],
    client: 'Bitovyxa',
    industry: 'Retail',
    year: 2022,
    services: ['E-commerce Development', 'Logistics Integration', 'Support'],
    technologies: ['Magento', 'Custom Extensions', 'ERP Integration'],
    challenge: 'Manage complex delivery logistics while providing excellent customer experience.',
    solution: 'Integrated real-time inventory, delivery scheduling, and installation booking with SMS notifications.',
    results: ['Delivery complaints down 80%', 'Customer satisfaction 4.7/5', 'Repeat purchases up 55%'],
  },
  {
    slug: 'btech',
    name: 'B-Tech',
    description: 'Technology consulting firm',
    fullDescription: 'A corporate website for a technology consulting firm showcasing services, case studies, and thought leadership.',
    category: 'web',
    tags: ['Technology', 'B2B', 'Corporate'],
    thumbnail: '/content/img/portfolio/btech.png',
    images: [
      '/content/img/portfolio/btech.png',
    ],
    client: 'B-Tech Consulting',
    industry: 'Technology',
    year: 2023,
    services: ['Web Design', 'Development', 'Content Strategy'],
    technologies: ['Next.js', 'Contentful', 'Vercel'],
    challenge: 'Position the firm as a thought leader while generating enterprise leads.',
    solution: 'Created a content hub with whitepapers, webinars, and case studies with gated content strategy.',
    results: ['Lead generation up 250%', 'Webinar attendance 500+', 'Featured in TechCrunch'],
  },
];

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return portfolioProjects.find(p => p.slug === slug);
}

export function getProjectsByCategory(category: PortfolioCategory): PortfolioProject[] {
  if (category === 'all') return portfolioProjects;
  return portfolioProjects.filter(p => p.category === category);
}

export function getRelatedProjects(slug: string, limit: number = 3): PortfolioProject[] {
  const current = getProjectBySlug(slug);
  if (!current) return [];

  return portfolioProjects
    .filter(p => p.slug !== slug && p.category === current.category)
    .slice(0, limit);
}
