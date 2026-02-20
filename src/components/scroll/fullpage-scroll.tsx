'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { ScrollProvider } from './scroll-context';
import { ScrollContainer } from './scroll-container';
import { PaginationDots } from './pagination-dots';

interface FullPageScrollProps {
  children: ReactNode;
  totalSections: number;
  showPagination?: boolean;
  onSectionChange?: (section: number) => void;
}

export function FullPageScroll({
  children,
  totalSections,
  showPagination = true,
  onSectionChange,
}: FullPageScrollProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: Simple normal scroll
  if (isMobile) {
    return (
      <ScrollProvider totalSections={totalSections} onSectionChange={onSectionChange}>
        <div className="w-full">
          <ScrollContainer>{children}</ScrollContainer>
        </div>
      </ScrollProvider>
    );
  }

  // Desktop: Fixed viewport with full-page scroll
  return (
    <ScrollProvider totalSections={totalSections} onSectionChange={onSectionChange}>
      {/* Fixed viewport container */}
      <div
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <ScrollContainer>{children}</ScrollContainer>
      </div>
      {showPagination && <PaginationDots />}
    </ScrollProvider>
  );
}
