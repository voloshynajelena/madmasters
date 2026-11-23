import { NextResponse } from 'next/server';
import { freshProjects } from '@/lib/public-projects';

/**
 * The newest work: the three most recently started projects.
 *
 * This used to read a `freshWorks` collection — a third list of projects,
 * maintained by hand alongside the knowledge base and the portfolio, with its
 * own admin screen and its own idea of what a project is. Three sources meant
 * three chances to disagree, and the one nobody updated was this one.
 *
 * Derived now. Nothing to maintain, so nothing to go stale: start a project,
 * publish it, and it is the freshest thing on the site until the next one.
 */
export const revalidate = 3600;

export async function GET() {
  try {
    const items = await freshProjects(3);
    return NextResponse.json({ items, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error('Error in fresh works API:', error);
    return NextResponse.json(
      { items: [], lastUpdated: new Date().toISOString(), error: 'Failed to fetch' },
      { status: 500 },
    );
  }
}
