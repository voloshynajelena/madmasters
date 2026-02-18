'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { useScrollContext } from './scroll-context';
import { cn } from '@/lib/utils';

interface ScrollSectionProps {
  children: ReactNode;
  index: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Scroll section - replicates the original CSS positioning
 *
 * Key insight from original:
 * - Sections 1, 2, 5 are in the wrapper flow (absolute positioning)
 * - Sections 3, 4 are fixed but positioned OFF-SCREEN (top: 100vh) initially
 * - When active, they move into view
 */
export function ScrollSection({
  children,
  index,
  className,
  style,
  id,
}: ScrollSectionProps) {
  const { currentSection, isMobile, animationDuration } = useScrollContext();

  const isActive = currentSection === index;

  if (isMobile) {
    return (
      <section
        id={id || `section-${index}`}
        className={cn('min-h-screen w-full', className)}
        style={style}
        data-section={index}
      >
        {children}
      </section>
    );
  }

  const getSectionStyle = (): CSSProperties => {
    const baseTransition = `all ${animationDuration}ms ease`;

    // Section 1: Hero - absolute at top 0
    if (index === 1) {
      return {
        position: 'absolute',
        top: '0%',
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 10,
        ...style,
      };
    }

    // Section 2: About - absolute at top 100%, z-index 12 (above fixed sections)
    if (index === 2) {
      return {
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 12,
        ...style,
      };
    }

    // Section 3: Services - FIXED
    // Starts off-screen left (-100vw)
    // Slides to left:0 when section 3 is active
    // Slides back to -100vw when leaving
    // IMPORTANT: Counter-transform to compensate for wrapper's -100% transform
    if (index === 3) {
      const isSection3OrLater = currentSection >= 3;
      const leftPosition = currentSection === 3 ? '0' : '-100vw';

      // When wrapper is at -100% (sections 2-4), we need to counter-transform
      const needsCounterTransform = currentSection >= 2 && currentSection <= 4;
      const counterTransform = needsCounterTransform ? 'translateY(100vh)' : 'translateY(0)';

      return {
        position: 'fixed',
        top: 0,
        left: leftPosition,
        width: '100vw',
        height: '100vh',
        zIndex: isSection3OrLater ? 20 : 1,
        transition: baseTransition,
        visibility: isSection3OrLater ? 'visible' : 'hidden',
        transform: counterTransform,
        ...style,
      };
    }

    // Section 4: Portfolio - FIXED
    // Hidden when sections 1-2 are active
    // Visible (behind section 3) when section 3 is active
    // Fully visible when section 4 is active
    // IMPORTANT: Counter-transform to compensate for wrapper's -100% transform
    if (index === 4) {
      const isSection3OrLater = currentSection >= 3;

      let zIndex = 1;
      if (currentSection === 3) {
        zIndex = 7; // Behind section 3 (z-index 20)
      } else if (currentSection >= 4) {
        zIndex = 15;
      }

      // When wrapper is at -100% (sections 2-4), we need to counter-transform
      const needsCounterTransform = currentSection >= 2 && currentSection <= 4;
      const counterTransform = needsCounterTransform ? 'translateY(100vh)' : 'translateY(0)';

      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex,
        transition: baseTransition,
        visibility: isSection3OrLater ? 'visible' : 'hidden',
        transform: counterTransform,
        ...style,
      };
    }

    // Section 5: Footer - absolute at 200%
    if (index === 5) {
      return {
        position: 'absolute',
        top: '200%',
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 10,
        ...style,
      };
    }

    // Default
    return {
      position: 'absolute',
      top: `${(index - 1) * 100}%`,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 1,
      ...style,
    };
  };

  return (
    <section
      id={id || `section-${index}`}
      className={cn(
        'section overflow-hidden',
        isActive && 'active',
        className
      )}
      style={getSectionStyle()}
      data-section={index}
      data-index={index}
      data-active={isActive}
    >
      {children}
    </section>
  );
}
