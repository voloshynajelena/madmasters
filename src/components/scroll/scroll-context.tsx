'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  useFullPageScroll,
  type UseFullPageScrollOptions,
  type FullPageScrollReturn,
} from './use-fullpage-scroll';

const ScrollContext = createContext<FullPageScrollReturn | null>(null);

export function useScrollContext(): FullPageScrollReturn {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
}

interface ScrollProviderProps extends UseFullPageScrollOptions {
  children: ReactNode;
}

export function ScrollProvider({ children, ...options }: ScrollProviderProps) {
  const scrollState = useFullPageScroll(options);

  return (
    <ScrollContext.Provider value={scrollState}>
      {children}
    </ScrollContext.Provider>
  );
}
