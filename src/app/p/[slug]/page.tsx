import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { PublicPortfolio } from '@/components/admin/portfolios/public-portfolio';
import type { PortfolioVersion } from '@/lib/firebase/types';

/**
 * A portfolio, opened without a login.
 *
 * The address is a random token rather than the portfolio's name, because
 * this page carries a phone number and an email and a guessable address
 * would hand those to anyone who tried `/p/shopify`. Switching sharing off
 * makes the page a 404 immediately while keeping the token, so turning it
 * back on revives a link already sent rather than breaking it.
 *
 * It is the same component the builder previews, fed the same data. There is
 * no second rendering of a portfolio to drift out of step with the first.
 */

export const dynamic = 'force-dynamic';

async function findVersion(slug: string): Promise<PortfolioVersion | null> {
  const snapshot = await getAdminDb()
    .collection('portfolioVersions')
    .where('share.slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  if (!data.share?.enabled) return null;

  return {
    ...data,
    id: snapshot.docs[0].id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
  } as unknown as PortfolioVersion;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const version = await findVersion(params.slug);
  if (!version) return { title: 'Not found', robots: { index: false, follow: false } };

  const { fullName, headline } = version.profile;

  return {
    title: [fullName, headline].filter(Boolean).join(' — ') || 'Portfolio',
    description: version.profile.summary?.slice(0, 160),
    // A link meant for one employer should not become a search result. This
    // is the whole reason the page is reachable by token rather than listed.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function SharedPortfolioPage({ params }: { params: { slug: string } }) {
  const version = await findVersion(params.slug);
  if (!version) notFound();

  return <PublicPortfolio profile={version.profile} items={version.items ?? []} />;
}
