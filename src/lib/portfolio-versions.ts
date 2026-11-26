import 'server-only';

/**
 * Seeding a portfolio version from the knowledge base.
 *
 * A new version starts as the truth: every project, with its real one-liner,
 * stack, components and decisions, in a sensible order. From that moment the
 * copy is the user's to cut down and reword for one application, and nothing
 * they do to it reaches the knowledge base.
 *
 * This file is the only place that knows how a project becomes a portfolio
 * item, so creating a version and resyncing one item use the same mapping and
 * cannot drift — which is the mistake the public portfolio route made with
 * its two inline copies.
 */

import { getAdminDb } from '@/lib/firebase/admin';
import type { PortfolioItem, PortfolioProfile } from '@/lib/firebase/types';

/** A date as an ISO string, whatever Firestore handed back. */
function isoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  const ts = value as { toDate?: () => Date; _seconds?: number; seconds?: number };
  if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
  const seconds = ts._seconds ?? ts.seconds;
  if (typeof seconds === 'number') return new Date(seconds * 1000).toISOString();
  return undefined;
}

function year(value: unknown): number | undefined {
  const iso = isoDate(value);
  return iso ? new Date(iso).getFullYear() : undefined;
}

/** Every named technology on a project, deduplicated, placeholders dropped. */
function stackOf(data: Record<string, any>): string[] {
  const slots = Object.values(data.stack ?? {}) as { name?: string }[];
  const fromStack = slots.map(s => s?.name).filter(Boolean) as string[];
  const fromComponents = (data.components ?? []).flatMap((c: any) =>
    [c?.stack?.language, c?.stack?.framework, c?.stack?.runtime, c?.stack?.hosting].filter(Boolean),
  ) as string[];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of [...fromStack, ...fromComponents]) {
    const clean = name.trim();
    if (!clean) continue;

    // "TBD" and "None" are how the knowledge base records an unanswered
    // question, and the answer is sometimes written out: one project's
    // analytics slot says "None — no React, no Firebase", which is a sentence
    // about the project rather than a technology on it. Matching the prefix
    // rather than the whole value is what catches those.
    if (/^(tbd|none|n\/?a|—|-|\?)\b/i.test(clean)) continue;

    // A technology name is short. Anything longer is a note that was typed
    // into a name field, and it would sit in a chip looking like a mistake.
    if (clean.length > 40) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

/**
 * Drop keys whose value is `undefined`.
 *
 * Firestore rejects an undefined value outright — "Cannot use 'undefined' as
 * a Firestore value" — and a new version is written straight from these
 * objects with `set()`, with no JSON round trip in between to quietly drop
 * them. An optional field that nothing filled in has to be *absent*, not
 * present and empty.
 */
function compact<T extends Record<string, unknown>>(value: T): T {
  const out = {} as Record<string, unknown>;
  for (const [key, v] of Object.entries(value)) {
    if (v !== undefined) out[key] = v;
  }
  return out as T;
}

/** One knowledge base project, as a portfolio item starts life. */
export function itemFromProject(data: Record<string, any>, order: number): PortfolioItem {
  const portfolio = data.portfolio ?? {};
  const started = year(data.startDate) ?? portfolio.year;
  const ended = year(data.endDate);

  return compact({
    projectKey: data.key,
    // Everything is shown by default, because the decision this screen
    // exists for is what to *remove* for a given reader. Starting with
    // everything hidden would make the first version the most work.
    enabled: true,
    order,

    name: data.name ?? data.key,
    oneLiner: data.oneLiner ?? '',
    role: data.owner && data.techLead === data.owner ? 'Owner, tech lead' : undefined,
    period: started ? `${started}${ended && ended !== started ? `–${ended}` : ''}` : undefined,
    description: portfolio.fullDescription || data.essence || '',
    // The knowledge base keeps one small image and a list of large ones, which
    // is exactly the logo-and-screenshot split a tile needs — it just never
    // said so. `thumbnail` is square and tiny on every record that has one;
    // `images` are full-page captures.
    logo: portfolio.thumbnail || undefined,
    screenshot: portfolio.images?.[0] || undefined,
    // The first image is the tile; the gallery is what comes after it, so the
    // details panel does not open on the picture the reader just clicked.
    gallery: (portfolio.images ?? []).slice(1),
    thumbnail: portfolio.thumbnail || '',
    liveUrl: data.productUrls?.[0] || '',
    tags: portfolio.tags?.length ? portfolio.tags : data.tags ?? [],
    stack: stackOf(data),
    // The component's own stack comes across too. It was being dropped, which
    // is why a project with a SwiftUI widget inside a React Native app showed
    // one undifferentiated pile of technologies.
    components: (data.components ?? []).map((c: any) =>
      compact({
        kind: c.kind,
        name: c.name,
        oneLiner: c.oneLiner || undefined,
        path: c.path || undefined,
        stack: c.stack && Object.values(c.stack).some(Boolean) ? compact(c.stack) : undefined,
        distribution: c.distribution || undefined,
        notes: c.notes || undefined,
        screenshots: c.screenshots ?? [],
      }),
    ),
    decisions: (data.decisions ?? []).map((d: any) =>
      compact({
        title: d.title,
        choice: d.choice,
        rationale: d.rationale,
        tradeoffs: d.tradeoffs || undefined,
      }),
    ),
    highlights: [],
    history: data.history ?? undefined,
    blocks: {
      description: true,
      stack: true,
      components: true,
      decisions: true,
      highlights: true,
      links: true,
    },
  });
}

/**
 * Default items for a new version: every project, newest first.
 *
 * Archived projects are included but switched off. They are part of the
 * record and occasionally the most relevant thing in it, so hiding them
 * entirely would mean re-entering them by hand; defaulting them off keeps
 * the first draft clean.
 */
export async function defaultItems(): Promise<PortfolioItem[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('projects').get();

  const projects = snapshot.docs
    .map(doc => doc.data())
    .sort((a, b) => {
      const at = isoDate(a.startDate) ?? isoDate(a.createdAt) ?? '';
      const bt = isoDate(b.startDate) ?? isoDate(b.createdAt) ?? '';
      return bt.localeCompare(at);
    });

  return projects.map((data, index) => {
    const item = itemFromProject(data, index);
    if (data.status === 'archived') item.enabled = false;
    return item;
  });
}

/** One project, re-read from the knowledge base. Null when it is gone. */
export async function itemForProject(projectKey: string, order: number): Promise<PortfolioItem | null> {
  const db = getAdminDb();
  const snapshot = await db.collection('projects').where('key', '==', projectKey).limit(1).get();
  if (snapshot.empty) return null;
  return itemFromProject(snapshot.docs[0].data(), order);
}

/**
 * A starting profile.
 *
 * The knowledge base knows about projects, not about the person, so there is
 * little to take from it beyond the technologies that show up most often —
 * which is a fair first guess at a headline stack and a poor guess at
 * everything else. The rest is left blank for the CV import or the user to
 * fill, rather than invented.
 */
export async function defaultProfile(): Promise<PortfolioProfile> {
  const items = await defaultItems();

  const counts = new Map<string, { name: string; n: number }>();
  for (const item of items) {
    if (!item.enabled) continue;
    for (const tech of item.stack) {
      const key = tech.toLowerCase();
      const seen = counts.get(key);
      counts.set(key, { name: seen?.name ?? tech, n: (seen?.n ?? 0) + 1 });
    }
  }

  // The headline stack is read in a glance, so it has to be names: "React",
  // "TypeScript". A project's own stack may legitimately say "GitHub + host
  // integration" or "Better Auth with Google OAuth" — accurate on the project
  // page, a paragraph in a chip at the top of a portfolio.
  const isAName = (name: string) =>
    name.length <= 24 && !/[+/]|\bwith\b|\band\b/i.test(name);

  const ranked = Array.from(counts.values()).sort(
    (a, b) => b.n - a.n || a.name.localeCompare(b.name),
  );

  const stack = [
    ...ranked.filter(t => isAName(t.name)),
    // Phrases are not dropped outright, only demoted: on a profile whose
    // projects all describe their stack that way, an empty list would be
    // worse than a wordy one.
    ...ranked.filter(t => !isAName(t.name)),
  ]
    .slice(0, 12)
    .map(t => t.name);

  return { fullName: '', headline: '', summary: '', links: [], stack };
}
