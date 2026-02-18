import { MetadataRoute } from 'next';

const baseUrl = 'https://madmasters.pro';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/about',
    '/services',
    '/work',
    '/contact',
    '/calculator',
    '/brief',
    '/fresh',
  ];

  const routes: MetadataRoute.Sitemap = [];

  // English pages
  staticPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 1 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          fr: `${baseUrl}/fr${page}`,
        },
      },
    });
  });

  // French pages
  staticPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}/fr${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 0.9 : 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          fr: `${baseUrl}/fr${page}`,
        },
      },
    });
  });

  return routes;
}
