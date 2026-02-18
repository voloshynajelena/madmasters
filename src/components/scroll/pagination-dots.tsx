'use client';

import { useScrollContext } from './scroll-context';
import { cn } from '@/lib/utils';

/**
 * Pagination dots matching the original CSS:
 * - Diamond shape (45° rotated square)
 * - Active: larger, outline only
 * - Inactive: smaller, filled
 */
export function PaginationDots() {
  const { currentSection, totalSections, goToSection, isMobile } =
    useScrollContext();

  if (isMobile) {
    return null;
  }

  return (
    <ul
      className="onepage-pagination fixed z-50 list-none m-0 p-0"
      style={{
        right: '10px',
        top: '39.4vh',
        paddingRight: '67px',
      }}
      aria-label="Page sections"
    >
      {Array.from({ length: totalSections }, (_, i) => {
        const section = i + 1;
        const isActive = currentSection === section;

        return (
          <li key={section} className="p-0 text-center cursor-pointer">
            <a
              onClick={(e) => {
                e.preventDefault();
                goToSection(section);
              }}
              data-index={section}
              href={`#${section}`}
              className={cn(
                'block relative',
                isActive && 'active'
              )}
              style={{
                padding: '15px',
                width: '4px',
                height: '4px',
              }}
              aria-label={`Go to section ${section}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                className="absolute transition-all duration-200"
                style={{
                  content: '""',
                  // Diamond shape via transform
                  transform: 'matrix3d(0.7071, 0.7071, 0, 0, -0.7071, 0.7071, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
                  // Active: larger outline, Inactive: smaller filled
                  width: isActive ? '12px' : '5px',
                  height: isActive ? '12px' : '5px',
                  backgroundColor: isActive ? 'transparent' : 'rgb(68, 68, 68)',
                  border: isActive ? '1px solid rgb(68, 68, 68)' : '0px solid rgb(68, 68, 68)',
                  // Position adjustment for active state
                  marginTop: isActive ? '-4px' : '0',
                  left: isActive ? '11px' : '15px',
                  top: '15px',
                }}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
