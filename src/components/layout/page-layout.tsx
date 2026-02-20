'use client';

import { type ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import type { Locale } from '@/i18n/config';

interface PageLayoutProps {
  children: ReactNode;
  locale: Locale;
  title?: string;
  subtitle?: string;
  bgColor?: string;
}

export function PageLayout({
  children,
  locale,
  title,
  subtitle,
  bgColor = '#e8e8e8',
}: PageLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <Header locale={locale} />

      {/* Hero Section */}
      {title && (
        <section
          className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] flex items-center justify-center px-4"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <div className="text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              {title}
            </h1>
            {subtitle && (
              <>
                <div className="w-16 sm:w-24 h-px bg-white/40 mx-auto mb-3 sm:mb-4" />
                <p className="text-white/60 text-base sm:text-lg">{subtitle}</p>
              </>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className={title ? '' : 'pt-20'}>{children}</main>

      <Footer locale={locale} />
    </div>
  );
}
