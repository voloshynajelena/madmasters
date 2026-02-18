import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { generateJsonLd } from '@/lib/seo/metadata';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://madmasters.pro'),
  title: {
    default: 'Mad Masters — Digital Product Studio',
    template: '%s | Mad Masters',
  },
  description:
    'We build high-converting websites, apps, and digital experiences for ambitious businesses.',
  keywords: [
    'web development',
    'digital marketing',
    'custom software',
    'web design',
    'SEO',
    'app development',
  ],
  authors: [{ name: 'Mad Masters' }],
  creator: 'Mad Masters',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://madmasters.pro',
    siteName: 'Mad Masters',
    title: 'Mad Masters — Digital Product Studio',
    description:
      'We build high-converting websites, apps, and digital experiences for ambitious businesses.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mad Masters — Digital Product Studio',
    description:
      'We build high-converting websites, apps, and digital experiences for ambitious businesses.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateJsonLd('en')),
          }}
        />
        {children}
      </body>
    </html>
  );
}
