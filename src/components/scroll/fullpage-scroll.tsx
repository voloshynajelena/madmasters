'use client';

import { type ReactNode } from 'react';
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
