'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PortfolioItem } from '@/lib/firebase/types';
import { COMPONENT_LABELS } from './portfolio-preview';

/**
 * A project as a visitor sees it, sliding in from the right of the page.
 *
 * Tabbed by component, because a project with a web app and an iOS app has
 * two of nearly everything: two stacks, two sets of screens, two things worth
 * saying. Flattened into one panel they become "React Native, Swift, Next.js,
 * Firestore" — a list that describes no single thing anybody could build.
 *
 * The first tab is the project itself: what it is, why it was built that way,
 * what it cost in trade-offs. Each tab after it is one piece, with its own
 * screens and its own stack. Components with nothing of their own to show are
 * not given a tab; they stay listed under the overview, where a bare name and
 * kind is all they were ever going to be.
 *
 * Nothing here is editable and nothing here is addressed to the owner.
 */

interface Props {
  item: PortfolioItem;
  onClose: () => void;
  /** Shown only inside the builder, where the owner may want to jump from
   *  looking at a project to changing it. */
  onEdit?: () => void;
}

type Tab = { key: string; label: string; component?: PortfolioItem['components'][number] };

export function VisitorDetails({ item, onClose, onEdit }: Props) {
  const components = item.blocks.components ? item.components : [];

  /**
   * A component earns a tab by having something a tab can hold — its own
   * screens or its own stack. A list of four kinds with nothing behind them
   * would be four empty rooms.
   */
  const tabs: Tab[] = useMemo(() => {
    const own = components.filter(
      c => (c.screenshots?.length ?? 0) > 0 || (c.stack && Object.values(c.stack).some(Boolean)),
    );
    return [
      { key: '__overview', label: 'Overview' },
      ...own.map((c, i) => ({
        key: `${c.kind}-${i}`,
        // The component's own name, not its kind. An iPhone app and an iPad
        // app are both kind `mobile-ios`, so labelling by kind gave Librora
        // two tabs reading "Mobile" and "iOS" for what are plainly "Mobile
        // app" and "iPad app" — the one piece of information the reader
        // needed was the one being thrown away.
        label: c.name?.trim() || COMPONENT_LABELS[c.kind] || c.kind,
        component: c,
      })),
    ];
  }, [components]);

  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [item.projectKey]);

  const tab = tabs[Math.min(active, tabs.length - 1)];

  // The project's own pictures on the overview; the component's own on its
  // tab. The tile image leads the project gallery, deduplicated, because a
  // gallery seeded from a project with one picture would show it twice.
  const images = tab.component
    ? (tab.component.screenshots ?? [])
    : Array.from(new Set([item.screenshot, ...(item.gallery ?? [])].filter(Boolean) as string[]));

  const logo = item.logo || item.thumbnail;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="absolute inset-0 z-20 bg-black/40 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col animate-[slideIn_200ms_cubic-bezier(0.65,0,0.35,1)]">
        <header className="shrink-0 px-6 pt-5 border-b border-border">
          <div className="flex items-start gap-3">
            {logo && (
              <div className="shrink-0 w-12 h-12 rounded-xl bg-surface ring-1 ring-border overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="w-full h-full object-contain p-1.5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{item.name}</h2>
                {item.period && <span className="text-xs text-text-muted">{item.period}</span>}
              </div>
              {item.oneLiner && <p className="mt-0.5 text-sm text-text-muted">{item.oneLiner}</p>}
              {item.role && (
                <span className="mt-2 inline-block text-[11px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                  {item.role}
                </span>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  title="Edit this project in this portfolio"
                  className="px-2.5 py-1 rounded-lg text-xs text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {tabs.length > 1 && (
            <nav className="mt-4 -mb-px flex gap-1 overflow-x-auto">
              {tabs.map((t, i) => (
                <button
                  key={t.key}
                  onClick={() => setActive(i)}
                  className={`shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    i === active
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-foreground'
                  }`}
                >
                  {t.label}
                  {t.component?.screenshots?.length ? (
                    <span className="ml-1.5 opacity-60">{t.component.screenshots.length}</span>
                  ) : null}
                </button>
              ))}
            </nav>
          )}
        </header>

        <div key={tab.key} className="flex-1 overflow-y-auto animate-[fadeIn_150ms_ease-out]">
          {images.length > 0 && <Gallery images={images} phone={Boolean(tab.component)} />}

          {tab.component ? (
            <ComponentBody component={tab.component} />
          ) : (
            <OverviewBody item={item} tabbed={tabs.slice(1).map(t => t.component!)} />
          )}
        </div>
      </aside>
    </>
  );
}

/**
 * The pictures.
 *
 * A phone screen is portrait and tall; the web app's capture is landscape.
 * Showing both in one fixed box means either letterboxing the phone into a
 * stripe or cropping the website to a sliver, so the box follows what it is
 * holding.
 */
function Gallery({ images, phone }: { images: string[]; phone: boolean }) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [images]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  const current = images[Math.min(index, images.length - 1)];

  return (
    <figure className="bg-surface-muted border-b border-border">
      <div
        className={`relative overflow-hidden flex items-center justify-center ${
          phone ? 'h-[22rem] py-4' : 'aspect-[16/10]'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          src={current}
          alt=""
          className={
            phone
              ? 'h-full w-auto object-contain rounded-xl animate-[fadeIn_200ms_ease-out]'
              : 'w-full h-full object-cover object-top animate-[fadeIn_200ms_ease-out]'
          }
        />

        {images.length > 1 && (
          <>
            <Arrow side="left" disabled={index === 0} onClick={() => setIndex(i => Math.max(i - 1, 0))} />
            <Arrow
              side="right"
              disabled={index >= images.length - 1}
              onClick={() => setIndex(i => Math.min(i + 1, images.length - 1))}
            />
            <span className="absolute bottom-2 right-3 px-1.5 py-0.5 rounded bg-black/55 text-[11px] text-white tabular-nums">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-3">
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              onClick={() => setIndex(i)}
              className={`shrink-0 overflow-hidden border transition-colors ${
                phone ? 'h-16 w-10 rounded' : 'w-20 aspect-[4/3] rounded-md'
              } ${i === index ? 'border-accent' : 'border-border hover:border-accent/50'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

function ComponentBody({ component }: { component: PortfolioItem['components'][number] }) {
  const stack = Object.entries(component.stack ?? {}).filter(([, v]) => v) as [string, string][];

  return (
    <div className="px-6 py-6 space-y-7">
      {component.oneLiner && (
        <p className="text-[15px] leading-[1.7] text-foreground/85">{component.oneLiner}</p>
      )}
      {component.notes && (
        <p className="text-[13px] leading-relaxed text-text-muted whitespace-pre-line">
          {component.notes}
        </p>
      )}

      {stack.length > 0 && (
        <Section title="Built with">
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {stack.map(([slot, value]) => (
              <div key={slot} className="flex items-baseline gap-2 min-w-0">
                <dt className="shrink-0 text-[11px] uppercase tracking-wide text-text-muted w-20">
                  {slot}
                </dt>
                <dd className="min-w-0 text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {component.distribution &&
        (/^https?:\/\//i.test(component.distribution) ? (
          <ExternalLink href={component.distribution} />
        ) : (
          // The field holds "where it is published", and for something not
          // published yet that is a sentence — "Not yet submitted". Rendering
          // every value as a link made those look like broken ones.
          <p className="text-[13px] text-text-muted">{component.distribution}</p>
        ))}
    </div>
  );
}

function OverviewBody({
  item,
  tabbed,
}: {
  item: PortfolioItem;
  tabbed: PortfolioItem['components'];
}) {
  // Components that got their own tab are not repeated here; the ones that
  // did not are still worth naming.
  const rest = item.blocks.components ? item.components.filter(c => !tabbed.includes(c)) : [];

  return (
    <div className="px-6 py-6 space-y-7">
      {item.blocks.description && item.description && (
        <p className="text-[15px] leading-[1.7] text-foreground/85 whitespace-pre-line">
          {item.description}
        </p>
      )}

      {item.blocks.highlights && item.highlights.filter(Boolean).length > 0 && (
        <ul className="space-y-2">
          {item.highlights.filter(Boolean).map((line, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/85">
              <span className="mt-[0.45rem] w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <Section title="Also part of it">
          <div className="grid gap-2 sm:grid-cols-2">
            {rest.map((c, i) => (
              <div key={`${c.name}-${i}`} className="rounded-lg border border-border px-3 py-2">
                <div className="text-[11px] font-medium text-accent">
                  {COMPONENT_LABELS[c.kind] ?? c.kind}
                </div>
                <div className="text-sm text-foreground">{c.name}</div>
                {c.oneLiner && (
                  <div className="mt-0.5 text-[11px] text-text-muted truncate" title={c.oneLiner}>
                    {c.oneLiner}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.blocks.stack && item.stack.length > 0 && (
        <Section title="Stack">
          <div className="flex flex-wrap gap-1.5">
            {item.stack.map(tech => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md bg-surface-hover text-xs text-foreground/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>
      )}

      {item.blocks.decisions && item.decisions.length > 0 && (
        <Section title="Technical decisions">
          <div className="space-y-3">
            {item.decisions.map((d, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">{d.title}</h4>
                  {d.choice && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                      {d.choice}
                    </span>
                  )}
                </div>
                {d.rationale && (
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">{d.rationale}</p>
                )}
                {d.tradeoffs && (
                  <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                    <span className="font-medium">Trade-off: </span>
                    {d.tradeoffs}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.blocks.links && item.liveUrl && <ExternalLink href={item.liveUrl} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
    >
      {href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}

function Arrow({
  side,
  disabled,
  onClick,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === 'left' ? 'left-2' : 'right-2'
      } w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 disabled:opacity-0 transition-all`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={side === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  );
}
