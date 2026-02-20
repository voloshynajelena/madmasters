'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
}

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/social-links')
      .then(res => res.json())
      .then(data => setSocialLinks(data.links || []))
      .catch(err => console.error('Failed to load social links:', err));
  }, []);

  return (
    <footer className="bg-[#1a1a1a] text-white py-16">
      <div className="container-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2">
            <img
              src="/images/logo-white.png"
              alt="Mad Masters"
              className="h-10 mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="text-white/60 text-sm max-w-md">
              Creative team that embodies the client's ideas with the help of code and coffee in a worthy representation on the Internet
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold mb-4 text-white/80">Navigation</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href={`${prefix}/about`} className="hover:text-white transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/services`} className="hover:text-white transition-colors">
                  {dict.nav.services}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/work`} className="hover:text-white transition-colors">
                  {dict.nav.work}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/contact`} className="hover:text-white transition-colors">
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-white/80">Contact</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="mailto:madmweb@gmail.com" className="hover:text-white transition-colors">
                  madmweb@gmail.com
                </a>
              </li>
              <li>Mon-Thu: 09:00-19:00</li>
              <li>Fri: 09:00-18:00</li>
            </ul>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={link.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} Mad Masters &mdash; {dict.footer.rights}
        </div>
      </div>
    </footer>
  );
}
