'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
}

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const dict = getDictionary(locale);

  useEffect(() => {
    fetch('/api/social-links')
      .then(res => res.json())
      .then(data => setSocialLinks(data.links || []))
      .catch(err => console.error('Failed to load social links:', err));
  }, []);

  const prefix = locale === 'en' ? '' : `/${locale}`;

  const navItems = [
    { href: `${prefix}/about`, label: dict.nav.about },
    { href: `${prefix}/services`, label: dict.nav.services },
    { href: `${prefix}/work`, label: 'Portfolio' },
    { href: `${prefix}/calculator`, label: 'Calculator' },
    { href: `${prefix}/brief`, label: 'Start Project', isHighlight: true },
    { href: `${prefix}/contact`, label: dict.nav.contact },
    { href: '/login', label: 'Admin', isAdmin: true },
  ];

  return (
    <header className="main-header fixed top-0 left-0 right-0 z-50 h-20">
      {/* Logo */}
      <Link
        href={prefix || '/'}
        className="logo absolute z-50 h-full w-1/2 p-3 block"
        style={{ color: 'rgba(97, 97, 97, 1)' }}
      >
        <img
          src="/images/logo.png"
          alt="Mad Masters"
          className="h-10 md:h-12 w-auto mt-4 ml-4"
        />
      </Link>

      {/* Hamburger Menu Input (hidden) */}
      <input
        id="hamburger"
        className="hamburger hidden"
        type="checkbox"
        checked={isMenuOpen}
        onChange={(e) => setIsMenuOpen(e.target.checked)}
      />

      {/* Hamburger Label */}
      <label
        htmlFor="hamburger"
        className="hamburger cursor-pointer absolute block z-[9999] h-5 w-[30px] top-[30px] right-4 sm:top-[78px] sm:right-[calc(4vw+12px)]"
      >
        <i
          className="absolute w-full pointer-events-auto"
          style={{
            height: '3px',
            top: '50%',
            backgroundColor: isMenuOpen ? 'transparent' : 'rgba(97, 97, 97, 1)',
            transition: 'all 0.35s',
            transitionDelay: '0.35s',
            transform: isMenuOpen ? 'rotate(90deg)' : 'none',
          }}
        >
          {/* Before line */}
          <span
            className="absolute block w-full"
            style={{
              height: '3px',
              left: '50%',
              backgroundColor: isMenuOpen ? 'rgba(255, 255, 255, 0.8)' : 'rgba(97, 97, 97, 1)',
              transition: 'transform 0.35s, background-color 0.35s',
              transformOrigin: '50% 50%',
              transform: isMenuOpen
                ? 'translate(-50%, -50%) rotate(315deg)'
                : 'translate(-50%, -8px)',
            }}
          />
          {/* After line */}
          <span
            className="absolute block w-full"
            style={{
              height: '3px',
              left: '50%',
              backgroundColor: isMenuOpen ? 'rgba(255, 255, 255, 0.8)' : 'rgba(97, 97, 97, 1)',
              transition: 'transform 0.35s, background-color 0.35s',
              transformOrigin: '50% 50%',
              transform: isMenuOpen
                ? 'translate(-50%, -50%) rotate(-315deg)'
                : 'translate(-50%, 8px)',
            }}
          />
        </i>
      </label>

      {/* Language Toggle */}
      <div
        className={cn(
          "langs absolute z-10 text-center hidden sm:block",
          "top-[80px] right-4 sm:top-[130px] sm:right-[85px]",
          "font-extrabold text-xs leading-4 text-[rgba(97,97,97,0.5)]",
          "transition-opacity duration-500",
          isMenuOpen ? "opacity-0" : "opacity-100"
        )}
      >
        <Link
          href="/"
          className={cn(
            'block text-left transition-colors',
            locale === 'en' ? 'text-[#616161]' : 'text-[rgba(97,97,97,0.5)] hover:text-[#616161]'
          )}
          style={{ transform: 'skew(-10deg)' }}
        >
          EN
        </Link>
        <span className="text-[rgba(97,97,97,0.5)]">/</span>
        <Link
          href="/fr"
          className={cn(
            'block text-left transition-colors',
            locale === 'fr' ? 'text-[#616161]' : 'text-[rgba(97,97,97,0.5)] hover:text-[#616161]'
          )}
          style={{ transform: 'skew(-10deg)' }}
        >
          FR
        </Link>
      </div>

      {/* Full Screen Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-[#1a1a1a] z-[998] flex flex-col transition-all duration-300 ease-out",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Menu Content */}
        <nav className="flex-1 flex flex-col justify-center px-6 sm:px-8 md:px-16">
          <ul className="space-y-0.5 sm:space-y-1">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-2 sm:py-3 text-xl sm:text-2xl md:text-3xl font-light tracking-wide transition-colors duration-200",
                    item.isHighlight
                      ? "text-accent hover:text-accent/80"
                      : item.isAdmin
                        ? "text-white/40 hover:text-white/60 text-base sm:text-lg md:text-xl"
                        : "text-white/80 hover:text-white"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section - Social Links */}
        <div className="px-8 md:px-16 pb-12">
          <div className="border-t border-white/10 pt-8">
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={link.icon} />
                  </svg>
                </a>
              ))}

              {/* Language Toggle in Menu */}
              <div className="ml-auto flex items-center gap-2 text-sm">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "transition-colors",
                    locale === 'en' ? 'text-white' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  EN
                </Link>
                <span className="text-white/20">/</span>
                <Link
                  href="/fr"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "transition-colors",
                    locale === 'fr' ? 'text-white' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  FR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
