'use client';

import type { PortfolioItem, PortfolioProfile } from '@/lib/firebase/types';

/**
 * The portfolio as a reader sees it.
 *
 * Presentational on purpose — it takes the version's data and renders it,
 * holds no state and knows nothing about editing. The builder passes the
 * live draft straight in, so what is on the right is literally the thing
 * being edited on the left rather than an approximation of it.
 *
 * Each project is a tile carrying a screenshot of the running product with
 * its logo on it. That ordering is the whole design: somebody skimming a
 * portfolio looks before they read, and a list of titles and technology chips
 * — which is what this was first — gives them nothing to look at.
 */

export const COMPONENT_LABELS: Record<string, string> = {
  web: 'Web',
  'mobile-ios': 'iOS',
  'mobile-android': 'Android',
  'mobile-cross': 'Mobile',
  'ios-widget': 'iOS widget',
  'ios-live-activity': 'Live Activity',
  watch: 'watchOS',
  'browser-extension': 'Browser extension',
  api: 'API',
  functions: 'Functions',
  cli: 'CLI',
  desktop: 'Desktop',
  bot: 'Bot',
  infra: 'Infrastructure',
  other: 'Other',
};

interface Props {
  profile: PortfolioProfile;
  items: PortfolioItem[];
  onOpenDetails: (projectKey: string) => void;
  activeKey?: string | null;
}

export function PortfolioPreview({ profile, items, onOpenDetails, activeKey }: Props) {
  const shown = items.filter(i => i.enabled).sort((a, b) => a.order - b.order);

  return (
    <div className="bg-background text-foreground">
      <header className="relative px-10 pt-14 pb-10 overflow-hidden">
        {/* A wash of the accent behind the name, so the page opens with
            something other than a wall of text. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full opacity-[0.07] blur-3xl bg-accent"
        />

        <div className="relative">
          <h1 className="text-[2.6rem] leading-[1.05] font-bold tracking-tight">
            {profile.fullName || <span className="text-text-muted font-normal">Your name</span>}
          </h1>
          {profile.headline && (
            <p className="mt-2 text-xl text-accent font-medium tracking-tight">{profile.headline}</p>
          )}

          {(profile.location || profile.email || profile.phone || profile.links.length > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              {profile.location && <span>{profile.location}</span>}
              {profile.email && (
                <>
                  <Dot />
                  <a href={`mailto:${profile.email}`} className="hover:text-accent transition-colors">
                    {profile.email}
                  </a>
                </>
              )}
              {profile.phone && (
                <>
                  <Dot />
                  <span>{profile.phone}</span>
                </>
              )}
              {profile.links.map(link => (
                <span key={link.url} className="flex items-center gap-3">
                  <Dot />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {link.label || link.url}
                  </a>
                </span>
              ))}
            </div>
          )}

          {profile.summary && (
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-foreground/85">
              {profile.summary}
            </p>
          )}

          {profile.stack.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {profile.stack.map(tech => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="px-10 pb-12">
        <div className="flex items-baseline justify-between pb-4 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
            Selected work
          </h2>
          <span className="text-xs text-text-muted">
            {shown.length} {shown.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="mt-8 text-sm text-text-muted">
            Nothing is switched on yet. Turn projects on in the list on the left.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2">
            {shown.map(item => (
              <ProjectTile
                key={item.projectKey}
                item={item}
                active={activeKey === item.projectKey}
                onOpen={() => onOpenDetails(item.projectKey)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectTile({
  item,
  active,
  onOpen,
}: {
  item: PortfolioItem;
  active: boolean;
  onOpen: () => void;
}) {
  const logo = item.logo || item.thumbnail;
  const kinds = item.blocks.components ? item.components.slice(0, 3) : [];
  const stack = item.blocks.stack ? item.stack : [];

  return (
    <article
      onClick={onOpen}
      className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200 ${
        active
          ? 'border-accent ring-1 ring-accent/40 bg-accent/[0.03]'
          : 'border-border bg-surface hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg'
      }`}
    >
      {/* The screenshot, cropped to the top of the page: that is where a site
          puts the thing it wants seen, and a centred crop of a long page is
          usually an empty band of its middle. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        {item.screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.screenshot}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <Placeholder item={item} />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
        />
      </div>

      <div className="relative px-5 pb-5">
        {/* The logo rides the seam between the capture and the text, which is
            what makes the tile read as a product rather than a card with a
            picture at the top. */}
        <div className="-mt-7 mb-3 flex items-end justify-between gap-3">
          <div className="w-14 h-14 rounded-xl bg-background ring-1 ring-border shadow-md flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="text-accent font-bold text-lg">{initials(item.name)}</span>
            )}
          </div>

          {item.period && (
            <span className="pb-1 text-xs text-white/90 drop-shadow md:text-text-muted md:drop-shadow-none">
              {item.period}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-[17px] font-semibold tracking-tight">{item.name}</h3>
          {item.role && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-hover text-text-muted">
              {item.role}
            </span>
          )}
        </div>

        {item.oneLiner && (
          <p className="mt-1 text-[13px] leading-relaxed text-text-muted line-clamp-2">
            {item.oneLiner}
          </p>
        )}

        {kinds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {kinds.map((c, i) => (
              <span
                key={`${c.name}-${i}`}
                className="px-2 py-0.5 rounded-md border border-border text-[11px] text-text-muted"
              >
                {componentChip(c.kind, c.name)}
              </span>
            ))}
            {item.components.length > kinds.length && (
              <span className="px-1.5 py-0.5 text-[11px] text-text-muted">
                +{item.components.length - kinds.length}
              </span>
            )}
          </div>
        )}

        {stack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stack.slice(0, 5).map(tech => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-surface-hover text-[11px] text-foreground/70"
              >
                {tech}
              </span>
            ))}
            {stack.length > 5 && (
              <span className="px-1.5 py-0.5 text-[11px] text-text-muted">+{stack.length - 5}</span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-medium text-accent group-hover:text-accent-hover transition-colors">
            Details →
          </span>
          {item.blocks.links && item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs text-text-muted hover:text-foreground transition-colors truncate"
            >
              {item.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * What a tile shows before there is a screenshot.
 *
 * Deliberately not a grey box with "no image": a portfolio with one missing
 * capture should still look finished. The initials sit on a tint derived from
 * the project's own name, so two placeholders next to each other are not the
 * same rectangle twice.
 */
function Placeholder({ item }: { item: PortfolioItem }) {
  let hash = 0;
  for (let i = 0; i < item.projectKey.length; i++) {
    hash = (hash * 31 + item.projectKey.charCodeAt(i)) % 360;
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hash} 55% 22%), hsl(${(hash + 40) % 360} 45% 14%))`,
      }}
    >
      <span className="text-4xl font-bold tracking-tight text-white/25">
        {initials(item.name)}
      </span>
    </div>
  );
}

function Dot() {
  return <span className="text-border">·</span>;
}

/**
 * Two letters standing in for a missing image.
 *
 * Taken from the initials of the words when there are several, so "Company
 * Portal" gives CO and "Mad Masters" gives MM. Punctuation is stripped first
 * because the obvious `name.slice(0, 2)` turns "J.O.C.A.S.T.A." into "J.",
 * which looks like a rendering fault rather than a monogram.
 */
function initials(name: string): string {
  const words = name.split(/[\s_-]+/).filter(Boolean);
  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map(w => w.replace(/[^\p{L}\p{N}]/gu, '').charAt(0))
      .join('')
      .toUpperCase();
  }
  return (words[0] ?? name).replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase();
}

/**
 * What a component chip says.
 *
 * The kind and the name are usually different ways of saying the same thing —
 * kind `web` is nearly always named "Web app" — and printing both gives
 * "Web · Web app", which reads like a bug. The name is kept only when it adds
 * something the kind does not, as "iOS widget · Home screen widget" does.
 */
function componentChip(kind: string, name: string): string {
  const label = COMPONENT_LABELS[kind] ?? kind;
  if (!name) return label;

  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const a = normalise(label);
  const b = normalise(name);
  if (b === a || b === `${a}app` || a.startsWith(b) || b.startsWith(a)) return name || label;

  return `${label} · ${name}`;
}
