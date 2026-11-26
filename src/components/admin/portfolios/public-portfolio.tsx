'use client';

import { useState } from 'react';
import type { PortfolioItem, PortfolioProfile } from '@/lib/firebase/types';
import { PortfolioPreview } from './portfolio-preview';
import { VisitorDetails } from './visitor-details';

/**
 * The portfolio as a page of its own, at a shared link.
 *
 * It holds exactly one piece of state — which project is open — and hands
 * everything else to the same two components the builder uses. That is the
 * point: there is no second rendering of a portfolio that could drift out of
 * step with the one its owner checked before sending the link.
 *
 * `onEdit` is deliberately not passed. A visitor gets no path back into the
 * admin, not even a dead button.
 */
export function PublicPortfolio({
  profile,
  items,
}: {
  profile: PortfolioProfile;
  items: PortfolioItem[];
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = items.find(i => i.projectKey === openKey) ?? null;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto max-w-3xl">
        <PortfolioPreview
          profile={profile}
          items={items}
          activeKey={openKey}
          onOpenDetails={setOpenKey}
        />
      </div>

      {/* The drawer positions itself against its container. In the builder
          that container is a pane of fixed height; here the page is as tall
          as the work is long, so it gets a viewport-sized frame of its own
          rather than stretching down the whole document. */}
      {open && (
        <div className="fixed inset-0 z-40">
          <VisitorDetails item={open} onClose={() => setOpenKey(null)} />
        </div>
      )}

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-text-muted">
          {profile.fullName}
          {profile.email && (
            <>
              {' · '}
              <a href={`mailto:${profile.email}`} className="hover:text-accent transition-colors">
                {profile.email}
              </a>
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
