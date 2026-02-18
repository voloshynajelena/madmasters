'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { useScrollContext } from './scroll-context';

interface ScrollContainerProps {
  children: ReactNode;
}

/**
 * Scroll container - replicates the original .onepage-wrapper behavior
 * The wrapper transforms vertically to show different sections
 */
export function ScrollContainer({ children }: ScrollContainerProps) {
  const { currentSection, isMobile, animationDuration, containerRef } =
    useScrollContext();

  const getTransformStyle = (): CSSProperties => {
    if (isMobile) {
      return {};
    }

    // Calculate transform based on original logic:
    // Section 1: 0%
    // Section 2: -100%
    // Sections 3-4: STOP at -100% (wrapper doesn't move)
    // Section 5: -200%
    let yOffset = 0;

    if (currentSection === 1) {
      yOffset = 0;
    } else if (currentSection === 2) {
      yOffset = -100;
    } else if (currentSection === 3 || currentSection === 4) {
      yOffset = -100; // stopTransform
    } else if (currentSection >= 5) {
      yOffset = -200;
    }

    return {
      transform: `translate3d(0, ${yOffset}%, 0)`,
      transition: `all ${animationDuration}ms ease`,
    };
  };

  if (isMobile) {
    return (
      <div ref={containerRef} className="w-full">
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="onepage-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'block',
        padding: 0,
        ...getTransformStyle(),
      }}
    >
      {children}
    </div>
  );
}
