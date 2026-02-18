import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';

const siteConfig = {
  name: 'Mad Masters',
  url: 'https://madmasters.pro',
  description: {
    en: 'Digital product studio specializing in web development, e-commerce, and digital marketing. We build beautiful, high-performance websites that convert.',
    fr: 'Studio de produits numériques spécialisé dans le développement web, l\'e-commerce et le marketing digital. Nous créons des sites web performants qui convertissent.',
  },
  keywords: {
    en: ['web development', 'web design', 'e-commerce', 'digital marketing', 'SEO', 'Next.js', 'React', 'portfolio'],
    fr: ['développement web', 'design web', 'e-commerce', 'marketing digital', 'SEO', 'Next.js', 'React', 'portfolio'],
  },
};

interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata(
  locale: Locale,
  page: PageMeta = {}
): Metadata {
  const isEn = locale === 'en';
  const baseUrl = siteConfig.url;
  const localePath = isEn ? '' : `/${locale}`;

  const title = page.title
    ? `${page.title} | ${siteConfig.name}`
    : `${siteConfig.name} - Digital Product Studio`;

  const description = page.description || siteConfig.description[locale];

  return {
    title,
    description,
    keywords: siteConfig.keywords[locale],
    authors: [{ name: 'Mad Masters' }],
    creator: 'Mad Masters',
    publisher: 'Mad Masters',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}${localePath}`,
      languages: {
        en: `${baseUrl}`,
        fr: `${baseUrl}/fr`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_US' : 'fr_FR',
      url: `${baseUrl}${localePath}`,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: page.image || `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [page.image || `${baseUrl}/og-image.jpg`],
    },
    robots: page.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateJsonLd(locale: Locale) {
  const isEn = locale === 'en';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/images/logo.png`,
        },
        sameAs: [
          'https://www.facebook.com/madmweb',
          'https://www.instagram.com/mad.masters/',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'French'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description[locale],
        publisher: {
          '@id': `${siteConfig.url}/#organization`,
        },
        inLanguage: isEn ? 'en-US' : 'fr-FR',
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${siteConfig.url}/#service`,
        name: siteConfig.name,
        description: siteConfig.description[locale],
        url: siteConfig.url,
        priceRange: '$$',
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 48.8566,
            longitude: 2.3522,
          },
          geoRadius: '5000',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: isEn ? 'Web Development Services' : 'Services de développement web',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: isEn ? 'Website Development' : 'Développement de sites web',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: isEn ? 'E-commerce Solutions' : 'Solutions e-commerce',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: isEn ? 'Digital Marketing' : 'Marketing digital',
              },
            },
          ],
        },
      },
    ],
  };
}
