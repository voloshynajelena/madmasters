'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HeroOverlayProps {
  className?: string;
}

/**
 * Animated overlay for the hero section
 * - White semi-transparent block slides down from top
 * - Black semi-transparent block slides in from right
 * - Content fades in after overlays animate
 */
export function HeroOverlay({ className }: HeroOverlayProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Start animation after a short delay (matches video load timing)
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* White overlay - slides down from top */}
      <div
        className={cn(
          'absolute w-1/2 h-full left-0 bg-white/30 transition-all duration-500 ease-out',
          isAnimated ? 'top-0' : '-top-full'
        )}
        style={{ transitionDelay: '300ms' }}
      />

      {/* Black overlay - slides in from right */}
      <div
        className={cn(
          'absolute w-1/2 h-full top-0 bg-black/30 transition-all duration-500 ease-out',
          isAnimated ? 'left-1/2' : 'left-full'
        )}
      />
    </div>
  );
}
