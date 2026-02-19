'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { FullPageScroll, ScrollSection } from '@/components/scroll';
import { HeroVideo, HeroOverlay } from '@/components/hero';
import { HomeFreshWorks } from '@/components/home/home-fresh-works';

interface HomePageProps {
  locale: Locale;
  dict: Dictionary;
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

export function HomePage({ locale, dict }: HomePageProps) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const [activeSection, setActiveSection] = useState(1);

  return (
    <FullPageScroll totalSections={5} onSectionChange={setActiveSection}>
      {/* Section 1: Hero - KEPT AS IS */}
      <ScrollSection index={1} className="bg-primary">
        <HeroVideo mp4Src="/videos/hero.mp4" />
        <HeroOverlay />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance">
            {dict.hero.headline}
          </h1>
          <div className="w-24 h-px bg-white/40 mb-6" />
          <p className="text-base md:text-lg text-white/70 max-w-2xl mb-10 font-light">
            {dict.hero.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`${prefix}/brief`}
              className="px-8 py-4 bg-accent text-white text-sm tracking-wider hover:bg-accent-hover transition-all hover:shadow-glow rounded-lg"
            >
              {dict.cta.startProject || 'START PROJECT'}
            </Link>
            <Link
              href={`${prefix}/work`}
              className="px-8 py-4 border border-white/40 text-white text-sm tracking-wider hover:border-white hover:bg-white/10 transition-colors rounded-lg backdrop-blur-sm"
            >
              {dict.cta.viewWork}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50 animate-pulse">
          <span className="text-xs tracking-widest mb-2">SCROLL</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </ScrollSection>

      {/* Section 2: About - MODERNIZED with glass effects & counters */}
      <ScrollSection index={2} className="mesh-gradient">
        <div className="flex flex-col items-center justify-center h-full px-4 py-20 relative">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl float float-delay-2" />

          <div className="container-section text-center relative z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium tracking-wider mb-6">
              {dict.sections.aboutTitle}
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 text-gray-900">
              WEB <span className="gradient-text">STUDIO</span>
            </h2>

            <p className="text-sm text-gray-600 max-w-xl mx-auto mt-6">
              Every project meets W3C and Google Developers standards
            </p>

            {/* Stats counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { value: 150, label: 'Projects Completed', suffix: '+' },
                { value: 8, label: 'Years Experience', suffix: '+' },
                { value: 50, label: 'Happy Clients', suffix: '+' },
                { value: 99, label: 'Success Rate', suffix: '%' },
              ].map((stat, i) => (
                <div key={i} className="glass-card-light p-6">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    <AnimatedCounter end={stat.value} active={activeSection >= 2} />
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Two columns */}
            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left max-w-4xl mx-auto">
              <div className="glass-card-light p-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Modern Technology</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We choose the most effective solutions for creating and operating your virtual office.
                  We define stylish and modern design with special attention to page speed and usability.
                </p>
              </div>
              <div className="glass-card-light p-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">SEO & Marketing</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Search engine optimization and website promotion is one of the most effective ways
                  to attract customers and increase visibility to your target audience.
                </p>
              </div>
            </div>

            {/* Process Steps - Modern */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-16">
              {Object.entries(dict.process).map(([key, label], index) => (
                <div key={key} className="flex items-center group">
                  <div className="flex flex-col items-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-accent mb-2 group-hover:shadow-glow-sm transition-shadow">
                      <ProcessIcon step={key} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                      {label}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className="hidden md:flex items-center">
                      <div className="w-8 h-px bg-accent/20" />
                      <div className="w-2 h-2 rounded-full bg-accent/20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Section 3: Services - BENTO GRID */}
      <ScrollSection index={3} className="mesh-gradient-dark">
        <div className="flex flex-col items-center justify-center h-full px-4 py-12">
          <div className="container-section">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium tracking-wider mb-4">
                WHAT WE DO
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Our <span className="gradient-text">Services</span>
              </h2>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {/* Large card - Web Development */}
              <div className="col-span-2 row-span-2 glass-card p-8 group cursor-pointer hover:border-accent/30 transition-all">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <ServiceIcon service="web" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {dict.services.web.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {dict.services.web.description}
                    </p>
                  </div>
                  <Link
                    href={`${prefix}/services`}
                    className="inline-flex items-center text-accent text-sm mt-6 group-hover:gap-3 gap-2 transition-all"
                  >
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Marketing */}
              <div className="col-span-2 glass-card p-6 group cursor-pointer hover:border-accent/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <ServiceIcon service="marketing" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {dict.services.marketing.title}
                    </h3>
                    <p className="text-white/50 text-xs line-clamp-2">
                      {dict.services.marketing.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Solutions */}
              <div className="glass-card p-6 group cursor-pointer hover:border-accent/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ServiceIcon service="custom" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Custom</h3>
                <p className="text-white/50 text-xs">Tailored solutions</p>
              </div>

              {/* Support */}
              <div className="glass-card p-6 group cursor-pointer hover:border-accent/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ServiceIcon service="support" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Support</h3>
                <p className="text-white/50 text-xs">24/7 maintenance</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link
                href={`${prefix}/calculator`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-all hover:shadow-glow"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate Project Cost
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Section 4: Portfolio - MODERN GRID */}
      <ScrollSection index={4} className="mesh-gradient">
        <div className="flex flex-col items-center justify-center h-full px-4 py-12">
          <div className="container-section text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-gray-800 text-white text-xs font-medium tracking-wider mb-4">
              PORTFOLIO
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {dict.sections.portfolioTitle}
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              {dict.sections.portfolioSubtitle}
            </p>

            {/* Portfolio Grid - Dynamic Fresh Works */}
            <HomeFreshWorks locale={locale} maxItems={3} />

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link
                href={`${prefix}/work`}
                className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                {dict.cta.seeAll}
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Section 5: Footer/Contact - MODERNIZED */}
      <ScrollSection index={5} className="gradient-bg">
        <div className="flex flex-col items-center justify-center h-full px-4 py-16 relative">
          {/* Decorative */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

          <div className="container-section text-center relative z-10">
            <img
              src="/images/logo-white.png"
              alt="Mad Masters"
              className="h-12 mx-auto mb-6 opacity-80"
              onError={(e) => {
                e.currentTarget.src = '/images/logo.png';
                e.currentTarget.className = 'h-12 mx-auto mb-6 invert opacity-80';
              }}
            />

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {dict.sections.contactTitle}
            </h2>

            <p className="text-white/60 max-w-md mx-auto mb-8">
              {dict.sections.contactDescription}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`${prefix}/brief`}
                className="px-8 py-4 bg-accent text-white text-sm font-medium tracking-wider rounded-lg hover:bg-accent-hover transition-all hover:shadow-glow"
              >
                START A PROJECT
              </Link>
              <Link
                href={`${prefix}/contact`}
                className="px-8 py-4 border-2 border-white/30 text-white text-sm font-medium tracking-wider rounded-lg hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                {dict.cta.getQuote}
              </Link>
            </div>

            {/* Footer bottom */}
            <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40">
              &copy; {new Date().getFullYear()} Mad Masters &mdash; {dict.footer.rights}
            </div>
          </div>
        </div>
      </ScrollSection>
    </FullPageScroll>
  );
}

// Animated counter component
function AnimatedCounter({ end, active }: { end: number; active: boolean }) {
  const count = useCounter(end, 1500, active);
  return <span>{count}</span>;
}

// Icons
function ProcessIcon({ step }: { step: string }) {
  const icons: Record<string, JSX.Element> = {
    strategy: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    design: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    development: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    testing: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    launch: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M5 3l14 9-14 9V3z" />
      </svg>
    ),
  };
  return icons[step] || null;
}

function ServiceIcon({ service }: { service: string }) {
  const icons: Record<string, JSX.Element> = {
    web: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    marketing: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    custom: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    support: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  };
  return icons[service] || null;
}

function SocialIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    vk: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.042-2.763-5.32-2.763-5.793 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
      </svg>
    ),
    viber: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.182.518 6.77.453 9.973c-.065 3.203-.133 9.21 5.644 10.878h.005l-.003 2.46s-.04.994.618 1.196c.796.245 1.262-.51 2.022-1.327.418-.45.992-1.112 1.428-1.617 3.942.332 6.97-.426 7.313-.537.79-.257 5.263-.83 5.988-6.768.748-6.127-.447-10.003-2.907-11.774 0 0-1.87-1.403-6.227-1.622-.345-.018-.689-.02-1.032-.014l.096.156zm.093 1.906c.307-.003.609.002.906.018 3.682.186 5.057 1.203 5.057 1.203 2.025 1.46 2.943 4.649 2.29 9.77-.594 4.883-4.173 5.185-4.83 5.398-.28.09-2.882.744-6.152.537 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.187-.165-.413l.02-4.017c-4.77-1.381-4.485-6.293-4.432-8.907.053-2.614.675-4.734 2.09-6.137C4.502 2.44 8.056 2.092 11.49 1.908z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
