'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dict = getDictionary(locale);

  const prefix = locale === 'en' ? '' : `/${locale}`;

  const navItems = [
    { href: `${prefix}/about`, label: dict.nav.about },
    { href: `${prefix}/services`, label: dict.nav.services },
    { href: `${prefix}/work`, label: dict.nav.work },
    { href: `${prefix}/fresh`, label: 'Fresh Works', isNew: true },
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
        className="hamburger cursor-pointer"
        style={{
          zIndex: 9999,
          position: 'absolute',
          display: 'block',
          height: '20px',
          width: '30px',
          top: '78px',
          right: 'calc(4vw + 12px)',
        }}
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
        className="langs absolute z-10 text-center"
        style={{
          top: '130px',
          right: '85px',
          font: "800 12px/16px 'Vaud Display', Helvetica, sans-serif",
          color: 'rgba(97, 97, 97, 0.5)',
          transition: 'opacity 500ms cubic-bezier(.19, 1, .22, 1) 0ms',
          opacity: isMenuOpen ? 0 : 1,
        }}
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
        <nav className="flex-1 flex flex-col justify-center px-8 md:px-16">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-3 text-2xl md:text-3xl font-light tracking-wide transition-colors duration-200",
                    item.isHighlight
                      ? "text-accent hover:text-accent/80"
                      : item.isAdmin
                        ? "text-white/40 hover:text-white/60 text-lg md:text-xl"
                        : "text-white/80 hover:text-white"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                  {item.isNew && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full align-middle">
                      NEW
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section - Social Links */}
        <div className="px-8 md:px-16 pb-12">
          <div className="border-t border-white/10 pt-8">
            <div className="flex items-center gap-6">
              <a
                href="https://www.facebook.com/madmweb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/mad.masters/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://new.vk.com/madmweb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.042-2.763-5.32-2.763-5.793 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                </svg>
              </a>
              <a
                href="viber://chat?number=+380964777690"
                rel="nofollow noopener"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.182.518 6.77.453 9.973c-.065 3.203-.133 9.21 5.644 10.878h.005l-.003 2.46s-.04.994.618 1.196c.796.245 1.262-.51 2.022-1.327.418-.45.992-1.112 1.428-1.617 3.942.332 6.97-.426 7.313-.537.79-.257 5.263-.83 5.988-6.768.748-6.127-.447-10.003-2.907-11.774 0 0-1.87-1.403-6.227-1.622-.345-.018-.689-.02-1.032-.014l.096.156zm.093 1.906c.307-.003.609.002.906.018 3.682.186 5.057 1.203 5.057 1.203 2.025 1.46 2.943 4.649 2.29 9.77-.594 4.883-4.173 5.185-4.83 5.398-.28.09-2.882.744-6.152.537 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.187-.165-.413l.02-4.017c-4.77-1.381-4.485-6.293-4.432-8.907.053-2.614.675-4.734 2.09-6.137C4.502 2.44 8.056 2.092 11.49 1.908z" />
                </svg>
              </a>

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
