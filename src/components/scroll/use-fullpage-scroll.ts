'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseFullPageScrollOptions {
  totalSections: number;
  animationDuration?: number;
  quietPeriod?: number;
  swipeThreshold?: number;
  mobileBreakpoint?: number;
}

export interface FullPageScrollState {
  currentSection: number;
  isAnimating: boolean;
  isMobile: boolean;
}

export interface FullPageScrollReturn extends FullPageScrollState {
  containerRef: React.RefObject<HTMLDivElement>;
  goToSection: (section: number) => void;
  goNext: () => void;
  goPrev: () => void;
  totalSections: number;
  animationDuration: number;
}

/**
 * Full-page scroll hook based on jquery.onepage-scroll.js
 * Rewritten for React with the custom scroll behavior:
 * - Sections 1-2: Normal vertical scroll
 * - Sections 3-4: Section 3 slides horizontally, section 4 is revealed
 * - Section 5: Vertical scroll continues
 */
export function useFullPageScroll(
  options: UseFullPageScrollOptions
): FullPageScrollReturn {
  const {
    totalSections,
    animationDuration = 1000,
    quietPeriod = 500,
    swipeThreshold = 50,
    mobileBreakpoint = 768,
  } = options;

  const [state, setState] = useState<FullPageScrollState>({
    currentSection: 1,
    isAnimating: false,
    isMobile: false,
  });

  const lastAnimationTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < mobileBreakpoint;
      setState((s) => ({ ...s, isMobile: isMobileView }));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Hash navigation on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const section = parseInt(hash.replace('#', ''), 10);
      if (section >= 1 && section <= totalSections && !isNaN(section)) {
        setState((s) => ({ ...s, currentSection: section }));
      }
    }
  }, [totalSections]);

  // Prevent body scroll when not mobile
  useEffect(() => {
    if (state.isMobile) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.add('disabled-onepage-scroll');
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.remove('disabled-onepage-scroll');
    }

    // Add viewing-page class to body
    document.body.className = document.body.className.replace(/\bviewing-page-\d+\b/g, '');
    document.body.classList.add(`viewing-page-${state.currentSection}`);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('disabled-onepage-scroll');
    };
  }, [state.isMobile, state.currentSection]);

  const canScroll = useCallback(() => {
    const now = Date.now();
    return now - lastAnimationTime.current >= animationDuration + quietPeriod;
  }, [animationDuration, quietPeriod]);

  const goToSection = useCallback(
    (section: number) => {
      if (section < 1 || section > totalSections) return;
      if (state.isAnimating) return;
      if (!canScroll()) return;
      if (section === state.currentSection) return;

      lastAnimationTime.current = Date.now();
      setState((s) => ({ ...s, currentSection: section, isAnimating: true }));

      // Update URL hash without scrolling
      window.history.replaceState(null, '', `#${section}`);

      // Clear animating flag after animation completes
      setTimeout(() => {
        setState((s) => ({ ...s, isAnimating: false }));
      }, animationDuration);
    },
    [totalSections, state.isAnimating, state.currentSection, canScroll, animationDuration]
  );

  const goNext = useCallback(() => {
    if (state.currentSection < totalSections) {
      goToSection(state.currentSection + 1);
    }
  }, [state.currentSection, totalSections, goToSection]);

  const goPrev = useCallback(() => {
    if (state.currentSection > 1) {
      goToSection(state.currentSection - 1);
    }
  }, [state.currentSection, goToSection]);

  // Wheel handler - matches original jquery.onepage-scroll.js
  useEffect(() => {
    if (state.isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!canScroll()) return;

      // Match original: wheelDelta is positive for scroll up, negative for scroll down
      // deltaY is opposite: positive for scroll down, negative for scroll up
      const delta = -e.deltaY;

      if (delta < 0) {
        goNext(); // Scroll down = go to next section
      } else if (delta > 0) {
        goPrev(); // Scroll up = go to previous section
      }
    };

    // Capture on document level with passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [state.isMobile, canScroll, goNext, goPrev]);

  // Touch handlers - matches original swipeEvents
  useEffect(() => {
    if (state.isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].pageY;
      touchStartX.current = e.touches[0].pageX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canScroll()) return;

      const deltaY = touchStartY.current - e.touches[0].pageY;
      const deltaX = touchStartX.current - e.touches[0].pageX;

      // Match original: >= 50px threshold
      if (Math.abs(deltaY) >= swipeThreshold || Math.abs(deltaX) >= swipeThreshold) {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // Vertical swipe
          e.preventDefault();
          if (deltaY >= swipeThreshold) {
            goNext(); // Swipe up = go down
          } else if (deltaY <= -swipeThreshold) {
            goPrev(); // Swipe down = go up
          }
        }
        // Reset touch start for next swipe
        touchStartY.current = e.touches[0].pageY;
        touchStartX.current = e.touches[0].pageX;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [state.isMobile, canScroll, swipeThreshold, goNext, goPrev]);

  // Keyboard handler - matches original
  useEffect(() => {
    if (state.isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();

      // Ignore if in input/textarea
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.which || e.keyCode) {
        case 38: // Arrow Up
          e.preventDefault();
          goPrev();
          break;
        case 40: // Arrow Down
          e.preventDefault();
          goNext();
          break;
        case 32: // Spacebar
          e.preventDefault();
          goNext();
          break;
        case 33: // Page Up
          e.preventDefault();
          goPrev();
          break;
        case 34: // Page Down
          e.preventDefault();
          goNext();
          break;
        case 36: // Home
          e.preventDefault();
          goToSection(1);
          break;
        case 35: // End
          e.preventDefault();
          goToSection(totalSections);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isMobile, goPrev, goNext, goToSection, totalSections]);

  return {
    ...state,
    containerRef,
    goToSection,
    goNext,
    goPrev,
    totalSections,
    animationDuration,
  };
}
