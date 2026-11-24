import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase/admin';
import { PortfolioBuilder } from '@/components/admin/portfolios/portfolio-builder';
import type { PortfolioVersion } from '@/lib/firebase/types';

/**
 * Loaded on the server so the builder opens with its content already in it.
 *
 * Fetching it from the client instead would mean a blank split screen for as
 * long as the round trip takes, on the one page where the whole point is
 * seeing the thing.
 */

export const dynamic = 'force-dynamic';

export default async function PortfolioBuilderPage({ params }: { params: { id: string } }) {
  const doc = await getAdminDb().collection('portfolioVersions').doc(params.id).get();
  if (!doc.exists) notFound();

  const data = doc.data()!;

  // Timestamps do not survive the boundary to a client component, and the
  // builder has no use for them beyond display.
  const version = {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
  } as unknown as PortfolioVersion;

  return <PortfolioBuilder initial={version} />;
}
