'use client';

import type { PortfolioItem, PortfolioProfile } from '@/lib/firebase/types';

/**
 * The portfolio as a reader sees it.
 *
 * Presentational on purpose — it takes the version's data and renders it,
 * holds no state and knows nothing about editing. The builder passes the
 * live draft straight in, so what is on the right is literally the thing
 * being edited on the left rather than an approximation of it.
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
      <header className="px-8 pt-10 pb-8 border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight">
          {profile.fullName || <span className="text-text-muted font-normal">Your name</span>}
        </h1>
        {profile.headline && (
          <p className="mt-1 text-lg text-accent font-medium">{profile.headline}</p>
        )}

        {(profile.location || profile.email || profile.phone || profile.links.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
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
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground/90">
            {profile.summary}
          </p>
        )}

        {profile.stack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
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
      </header>

      <section className="px-8 py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Selected work
          </h2>
          <span className="text-xs text-text-muted">
            {shown.length} {shown.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="mt-6 text-sm text-text-muted">
            Nothing is switched on yet. Turn projects on in the list on the left.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {shown.map(item => (
              <article
                key={item.projectKey}
                className={`rounded-xl border p-5 transition-colors ${
                  activeKey === item.projectKey
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-start gap-4">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover shrink-0 bg-surface-muted"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg shrink-0 bg-accent/10 text-accent flex items-center justify-center text-lg font-bold">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-base font-semibold">{item.name}</h3>
                      {item.period && (
                        <span className="text-xs text-text-muted">{item.period}</span>
                      )}
                      {item.role && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-text-muted">
                          {item.role}
                        </span>
                      )}
                    </div>

                    {item.oneLiner && (
                      <p className="mt-1 text-sm text-text-muted">{item.oneLiner}</p>
                    )}

                    {item.blocks.components && item.components.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.components.map((c, i) => (
                          <span
                            key={`${c.name}-${i}`}
                            className="px-2 py-0.5 rounded border border-border text-[11px] text-text-muted"
                          >
                            {componentChip(c.kind, c.name)}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.blocks.stack && item.stack.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.stack.slice(0, 10).map(tech => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded bg-surface-hover text-[11px] text-foreground/70"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => onOpenDetails(item.projectKey)}
                        className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                      >
                        Details →
                      </button>
                      {item.blocks.links && item.liveUrl && (
                        <a
                          href={item.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-text-muted hover:text-foreground transition-colors"
                        >
                          {item.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Dot() {
  return <span className="text-border">·</span>;
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
