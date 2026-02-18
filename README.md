---                                                                                                                                                                                            
MADMASTERS.PRO REWRITE — COMPLETE AUDIT & IMPLEMENTATION PLAN
                                                                                                                                                                                                 
---                                                                                                                                                                                            
PHASE 1: AUDIT & SPECIFICATION

1.1 Current Sitemap / Pages                                                                                                                                                                    
┌────────────────────────────────┬──────────────────────────┬──────────┐                                                                                                                       
│              URL               │           Type           │ Language │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /                              │ Homepage                 │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/                           │ Homepage                 │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /about/                        │ About                    │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/about/                     │ About                    │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /web/                          │ Web Development Services │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/web/                       │ Web Development Services │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /marketing/                    │ Internet Marketing       │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/marketing/                 │ Internet Marketing       │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /programming/                  │ Custom Development       │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/programming/               │ Custom Development       │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /portfolio/                    │ Portfolio Index          │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/portfolio/                 │ Portfolio Index          │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /portfolio/portfolio-*.html    │ 17 Portfolio Items       │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/portfolio/portfolio-*.html │ 17 Portfolio Items       │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /contacts/                     │ Contact                  │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/contacts/                  │ Contact                  │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /breef/                        │ Online Brief Form        │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/breef/                     │ Online Brief Form        │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /calc/                         │ Cost Calculator          │ RU       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /en/calc/                      │ Cost Calculator          │ EN       │
├────────────────────────────────┼──────────────────────────┼──────────┤
│ /students/*                    │ Student Projects         │ Mixed    │
└────────────────────────────────┴──────────────────────────┴──────────┘
Total: ~60 HTML files (30 RU + 30 EN duplicates)

  ---
1.2 Content Blocks Per Page (Homepage)
┌───────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│        Section        │                                                       Content                                                       │
├───────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 1 - Hero      │ Video background + 5-slide carousel (Web, Calculator, Audit, Email, Brief) with CTAs                                │
├───────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 2 - About     │ Who we are, W3C/Google compliance, 2-column value prop, 5-step process (Strategy→Design→Development→Testing→Launch) │
├───────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 3 - Services  │ 4-card grid: Web Dev, Marketing, Support, Content Management                                                        │
├───────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 4 - Portfolio │ 6-item portfolio grid with hover effects + "See All" CTA                                                            │
├───────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 5 - Footer    │ Contact CTA, social links, legal address, footer nav                                                                │
└───────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
  ---
1.3 Current Conversion Flow Analysis

Existing CTAs:
1. "Calculate Price" → /calc/ (cost calculator)
2. "Fill Brief" → /breef/ (online questionnaire)
3. "Order" buttons → Opens contact modal
4. "Order Call" → Opens contact modal
5. Portfolio items → Individual case study pages

What's Missing:
┌────────────────────────────────────┬─────────────────────┬────────────────────────────────────────────┐
│                Gap                 │       Impact        │               Recommendation               │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No clear value proposition on hero │ Low conversion      │ Add headline: "We build [X] for [Y]"       │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No testimonials/social proof       │ Low trust           │ Add testimonials section                   │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No client logos                    │ Low trust           │ Add "Trusted by" section                   │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No pricing indication              │ High friction       │ Add pricing tiers or "Starting from"       │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No results/metrics                 │ Low trust           │ Add case study metrics                     │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ CTA modal is generic               │ Low conversion      │ Create service-specific forms              │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No urgency/scarcity                │ Lower conversion    │ Add limited offer or response time promise │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ No FAQ                             │ Higher support load │ Add FAQ section                            │
├────────────────────────────────────┼─────────────────────┼────────────────────────────────────────────┤
│ Contact form not visible           │ High friction       │ Add inline contact form on homepage        │
└────────────────────────────────────┴─────────────────────┴────────────────────────────────────────────┘
  ---
1.4 SIGNATURE SCROLL BEHAVIOR — EXACT SPECIFICATION

This is the critical feature to preserve. Here's the exact behavior:

Core Mechanism

Plugin: jquery-onepage-scroll.js (Pete Rojwongsuriya, GPL v3)
Type: Full-page vertical scroll hijacking
Sections: 5 full-viewport sections (#section1 through #section5)

Step-by-Step Behavior

1. Page Load:
- All 5 sections are positioned absolutely, stacked vertically (0%, 100%, 200%, 300%, 400%)
- Section 1 is marked .active and body gets class viewing-page-1
- Pagination dots appear on right side
- Native scroll is completely disabled

2. Scroll/Wheel Event:
- mousewheel, DOMMouseScroll, MozMousePixelScroll events are captured
- event.preventDefault() blocks native scroll
- Delta direction determines: positive = up, negative = down
- Quiet period: 500ms — prevents rapid-fire scrolling
- Animation time: 1000ms — smooth slide transition

3. Transform Animation:
   transform: translate3d(0, -N00%, 0)  // N = section index - 1
   transition: all 1000ms ease

4. Touch/Swipe (Mobile):
- touchstart captures initial X/Y
- touchmove calculates delta
- Threshold: 50px movement triggers swipe
- swipeUp → next section, swipeDown → previous section

5. Keyboard Navigation:
- ↑ / Page Up → Previous section
- ↓ / Page Down / Space → Next section
- Home → Section 1
- End → Last section

6. Responsive Fallback:
- Below 600px width: scroll hijacking disabled
- body gets class disabled-onepage-scroll
- Normal browser scroll behavior restored

7. Custom Modifications (Lines 124-138):
- Sections 4 & 5 have special transform handling
- When Section 5 is active: #main transforms to -200%
- When Section 3 or 4 active: adds stopTransform class
- Section 5 gets slideUpSection5 class for footer reveal

8. Pagination Dots:
- Auto-generated <ul class="onepage-pagination">
- Click on dot → moveTo(page_index) navigates directly
- Active dot gets .active class

Acceptance Criteria for New Implementation
┌─────┬──────────────────────────────────────────────────┬─────────────────────────────────────────────┐
│  #  │                    Criterion                     │                 Test Method                 │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 1   │ Scroll wheel moves exactly one section           │ Manual scroll, verify single section change │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 2   │ Animation duration ~1000ms                       │ DevTools Performance tab                    │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 3   │ No scroll possible during animation              │ Rapid scroll, verify no section skip        │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 4   │ 500ms quiet period after animation               │ Console log timestamps                      │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 5   │ Swipe up/down works on touch devices             │ Mobile testing                              │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 6   │ 50px threshold for swipe                         │ Partial swipe should not trigger            │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 7   │ Keyboard nav (↑↓ Space Home End)                 │ Manual test                                 │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 8   │ Pagination dots navigate correctly               │ Click each dot                              │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 9   │ Active dot updates on scroll                     │ Visual verification                         │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 10  │ Below 600px: normal scroll                       │ Resize viewport                             │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 11  │ Loop disabled (can't scroll past first/last)     │ Test at boundaries                          │
├─────┼──────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 12  │ Hash navigation supported (#2 goes to section 2) │ URL hash test                               │
└─────┴──────────────────────────────────────────────────┴─────────────────────────────────────────────┘
  ---
1.5 HERO VIDEO BEHAVIOR — EXACT SPECIFICATION

Current Implementation

Video Element:
  <div id="videoBack" class="video-back">
    <video id="video" autoplay muted
      src="/content/video/video.mp4"
      type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
    </video>
  </div>

CSS:
.video-back {
display: none;        /* Initially hidden */
height: 100vh;
width: 100%;
position: fixed;
z-index: -1;          /* Behind content */
}
video {
min-width: 100vw;
min-height: 100vh;
position: fixed;
z-index: -1;
}

Animation Sequence:
T+0ms:     video.pause() — ensures clean start
T+500ms:   videoBack.display = "block" + video.play()
T+3500ms:  section1Slide1 slides down (white overlay)
section1Slide2 slides left (black overlay)
hero.display = "block"
T+4000ms:  hero.opacity = "1" — content fades in

Hero Slider (Inside Section 1):
- 5 slides with autoplay (8-second interval)
- Icon-based bottom navigation
- Slide transitions: CSS transforms with from-left / from-right classes
- Video pause/play management on slide change

Issues with Current Implementation:
┌────────────────────────────────────────┬────────────────────────────────────┐
│                 Issue                  │               Impact               │
├────────────────────────────────────────┼────────────────────────────────────┤
│ No poster image                        │ White flash before video loads     │
├────────────────────────────────────────┼────────────────────────────────────┤
│ No WebM fallback                       │ Larger file size, no alpha support │
├────────────────────────────────────────┼────────────────────────────────────┤
│ No reduced-motion check                │ Accessibility violation            │
├────────────────────────────────────────┼────────────────────────────────────┤
│ No lazy loading for video              │ CLS issues                         │
├────────────────────────────────────────┼────────────────────────────────────┤
│ autoplay without playsinline           │ iOS Safari won't autoplay          │
├────────────────────────────────────────┼────────────────────────────────────┤
│ Video hidden on mobile but still loads │ Wasted bandwidth                   │
└────────────────────────────────────────┴────────────────────────────────────┘
  ---
1.6 Proposed Information Architecture

Page Hierarchy

/                          Homepage (EN default)
├── /services/             Services Overview
│   ├── /services/web/     Web Development
│   ├── /services/marketing/  Digital Marketing
│   └── /services/custom/  Custom Development
├── /work/                 Portfolio/Case Studies
│   └── /work/[slug]/      Individual Case Study
├── /fresh/                Fresh & Active Works (NEW)
├── /about/                About Us
├── /contact/              Contact
├── /brief/                Online Brief
├── /calculator/           Cost Calculator
└── /fr/...                French versions (same structure)

Navigation Structure

Primary Nav:
1. Services (dropdown: Web / Marketing / Custom)
2. Work (portfolio)
3. Fresh (new feature)
4. About
5. Contact

Header Actions:
- Language toggle (EN | FR)
- "Get a Quote" CTA button

Mobile Nav:
- Hamburger → Full-screen overlay
- Same hierarchy, collapsible sections

CTA Placement Strategy
┌─────────────────────────────┬─────────────────────────────────────┬─────────────────────┐
│          Location           │                 CTA                 │       Purpose       │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────┤
│ Header (sticky)             │ "Get a Quote"                       │ Always visible      │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────┤
│ Hero (Section 1)            │ "Calculate Price" + "Start Project" │ Primary conversion  │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────┤
│ After Services (Section 3)  │ "Discuss Your Project"              │ Post-value-prop     │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────┤
│ After Portfolio (Section 4) │ "See Our Process"                   │ Trust building      │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────┤
│ Footer (Section 5)          │ "Book a Call" + Contact Form        │ Final capture       │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────┤
│ Each Service Page           │ Service-specific CTA                │ Targeted conversion │
└─────────────────────────────┴─────────────────────────────────────┴─────────────────────┘
Trust Section Strategy
┌──────────────────┬──────────────────────────────┬─────────────────────────────────────────┐
│     Element      │          Placement           │                 Content                 │
├──────────────────┼──────────────────────────────┼─────────────────────────────────────────┤
│ Client Logos     │ Section 2 or dedicated strip │ 6-8 recognizable logos                  │
├──────────────────┼──────────────────────────────┼─────────────────────────────────────────┤
│ Testimonials     │ New Section between 4-5      │ 2-3 client quotes with photos           │
├──────────────────┼──────────────────────────────┼─────────────────────────────────────────┤
│ Process Timeline │ Section 2                    │ Strategy → Design → Dev → Test → Launch │
├──────────────────┼──────────────────────────────┼─────────────────────────────────────────┤
│ Tech Stack       │ About page or footer         │ Technology badges                       │
├──────────────────┼──────────────────────────────┼─────────────────────────────────────────┤
│ Results Metrics  │ Case studies                 │ "+150% traffic", "2.5s load time"       │
├──────────────────┼──────────────────────────────┼─────────────────────────────────────────┤
│ Certifications   │ Footer                       │ W3C, Google Partners, etc.              │
└──────────────────┴──────────────────────────────┴─────────────────────────────────────────┘
  ---
1.7 Content Types / Data Model

Case Study

interface CaseStudy {
slug: string;
title: string;
client: string;
date: string;          // ISO date
status: 'live' | 'archived';
services: ('web' | 'marketing' | 'custom')[];
industry: string;
thumbnail: Image;
heroImage: Image;
gallery: Image[];
summary: string;       // 1-2 sentences
challenge: string;     // MDX
solution: string;      // MDX
results: Metric[];
testimonial?: Testimonial;
liveUrl?: string;
technologies: string[];
seo: SEOMeta;
i18n: Record<Locale, LocalizedCaseStudy>;
}

interface Metric {
label: string;
value: string;
icon?: string;
}

Service

interface Service {
slug: string;
title: string;
shortTitle: string;
icon: string;
summary: string;
description: string;     // MDX
features: Feature[];
pricing?: PricingTier[];
relatedCaseStudies: string[];  // slugs
cta: CTA;
seo: SEOMeta;
i18n: Record<Locale, LocalizedService>;
}

Testimonial

interface Testimonial {
id: string;
quote: string;
author: string;
role: string;
company: string;
avatar?: Image;
caseStudySlug?: string;
i18n: Record<Locale, LocalizedTestimonial>;
}

Fresh Work Item (NEW)

interface FreshWorkItem {
id: string;
source: 'github' | 'appstore';
title: string;
platform: 'web' | 'ios' | 'android' | 'macos' | 'cross-platform';
status: 'active' | 'recent' | 'archived';
lastActivity: string;        // ISO date
tags: string[];
links: {
github?: string;
appstore?: string;
website?: string;
};
thumbnail?: Image;
summary: string;
metrics?: {
stars?: number;
forks?: number;
commits30d?: number;
downloads?: number;
rating?: number;
};
releaseNotes?: string;
fetchedAt: string;          // Cache timestamp
}

  ---
PHASE 2: FRAMEWORK DECISION

2.1 Decision Matrix
┌─────────────────────────────┬────────────┬─────────┬───────────┬───────┬────────┐
│     Criterion (Weight)      │ Next.js 14 │ Astro 4 │ SvelteKit │ Remix │ Nuxt 3 │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ Performance/CWV (25%)       │ 9          │ 10      │ 9         │ 8     │ 8      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ SEO + Structured Data (20%) │ 9          │ 10      │ 8         │ 9     │ 9      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ i18n Ease (15%)             │ 8          │ 9       │ 7         │ 7     │ 9      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ Developer Experience (10%)  │ 9          │ 8       │ 8         │ 8     │ 8      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ Content Workflows (10%)     │ 9          │ 10      │ 7         │ 8     │ 8      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ Signature Scroll Impl (10%) │ 9          │ 9       │ 10        │ 8     │ 8      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ Vercel Compatibility (10%)  │ 10         │ 10      │ 9         │ 10    │ 7      │
├─────────────────────────────┼────────────┼─────────┼───────────┼───────┼────────┤
│ WEIGHTED TOTAL              │ 9.05       │ 9.55    │ 8.35      │ 8.20  │ 8.25   │
└─────────────────────────────┴────────────┴─────────┴───────────┴───────┴────────┘
2.2 Analysis by Criterion

Performance/CWV:
- Astro: Zero JS by default, island architecture, best LCP
- Next.js: Excellent with App Router, but ships more JS baseline
- SvelteKit: Very lean runtime, but less static optimization

SEO + Structured Data:
- Astro: Built-in sitemap, head management, MDX
- Next.js: Excellent with next-seo, generateMetadata API
- All support JSON-LD, OG tags natively

i18n:
- Astro: astro-i18n-aut or manual routing, simple
- Next.js: Built-in i18n routing, but App Router i18n is evolving
- Nuxt: Best built-in i18n with @nuxtjs/i18n

Signature Scroll:
- All frameworks can implement this with custom hooks/components
- SvelteKit: Slightly easier due to reactive primitives
- Astro + React/Svelte island: Clean separation of scroll logic

Vercel:
- Next.js: Native, zero-config
- Astro: Excellent adapter, full SSR/SSG support
- Nuxt: Works but not native

2.3 Recommendation

Primary: Astro 4 (with React islands)

Rationale:
1. Maximum performance: Zero JS pages by default, ship only what you need
2. Content-first: Built for content sites, MDX first-class
3. Flexible islands: Use React for scroll engine, static for everything else
4. SEO excellence: sitemap, robots, head management built-in
5. Vercel-native: Zero-config deployment with @astrojs/vercel
6. Future-proof i18n: Simple locale-based routing

Fallback: Next.js 14 (App Router)

If you need:
- More dynamic server features (ISR, server actions)
- Team familiarity with React ecosystem
- API routes for fresh works sync

  ---
PHASE 3: IMPLEMENTATION PLAN

3.1 Milestone Plan

Milestone 1: Foundation (Week 1)

- Repo setup with Astro + Tailwind + TypeScript
- Base layouts (Default, Fullpage)
- i18n routing setup (EN default, FR toggle)
- Design tokens / CSS variables
- Header + Footer components
- Vercel deployment pipeline

Milestone 2: Signature Scroll Engine (Week 1-2)

- FullPageScroll React component (island)
- Touch/swipe support
- Keyboard navigation
- Pagination dots
- Responsive fallback
- E2E tests with Playwright

Milestone 3: Hero Video Component (Week 2)

- HeroVideo component with poster fallback
- Reduced motion detection
- iOS Safari inline playback
- Lazy loading (IntersectionObserver)
- Video optimization (WebM + MP4 encoded)

Milestone 4: Homepage Sections (Week 2-3)

- Section 1: Hero with video + slider
- Section 2: About/Value prop
- Section 3: Services grid
- Section 4: Portfolio preview
- Section 5: Footer/Contact
- Trust elements (logos, process)

Milestone 5: Content Pages (Week 3)

- Service pages (web, marketing, custom)
- About page
- Contact page with form
- Brief page
- Calculator page

Milestone 6: Portfolio/Case Studies (Week 3-4)

- Portfolio index with filters
- Case study page template
- Migrate existing 17 portfolio items
- MDX content structure

Milestone 7: Fresh & Active Works (Week 4)

- GitHub API integration (repos, releases, activity)
- App Store API integration
- Build-time fetch + caching
- Fresh works page with filters
- Homepage section integration
- Fallback handling

Milestone 8: Polish & SEO (Week 4-5)

- All meta tags / OG images
- JSON-LD structured data
- Sitemap generation
- 301 redirects from old URLs
- Performance audit (Lighthouse)
- Accessibility audit

3.2 Repo Structure

madmasters/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   ├── fonts/
│   ├── videos/
│   │   ├── hero.mp4
│   │   ├── hero.webm
│   │   └── hero-poster.jpg
│   ├── og/
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── FullPageLayout.astro
│   ├── components/
│   │   ├── ui/                    # Primitives
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   └── ...
│   │   ├── sections/              # Page sections
│   │   │   ├── Hero.astro
│   │   │   ├── Services.astro
│   │   │   ├── Portfolio.astro
│   │   │   └── ...
│   │   ├── scroll/                # React islands
│   │   │   ├── FullPageScroll.tsx
│   │   │   ├── ScrollSection.tsx
│   │   │   └── Pagination.tsx
│   │   └── video/
│   │       └── HeroVideo.tsx
│   ├── content/
│   │   ├── config.ts              # Content collections
│   │   ├── case-studies/
│   │   │   └── [slug]/
│   │   │       ├── en.mdx
│   │   │       └── fr.mdx
│   │   ├── services/
│   │   └── testimonials/
│   ├── lib/
│   │   ├── fresh-works/
│   │   │   ├── github.ts
│   │   │   ├── appstore.ts
│   │   │   └── cache.ts
│   │   └── i18n/
│   │       ├── translations.ts
│   │       └── utils.ts
│   ├── pages/
│   │   ├── index.astro            # EN homepage
│   │   ├── fr/
│   │   │   └── index.astro        # FR homepage
│   │   ├── services/
│   │   ├── work/
│   │   ├── fresh/
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   └── [...slug].astro        # Catch-all for 404
│   └── styles/
│       ├── global.css
│       └── tokens.css
├── scripts/
│   └── sync-fresh-works.ts        # Build-time sync
└── tests/
└── scroll.spec.ts             # Playwright tests

3.3 Styling Approach

Tailwind CSS + CSS Custom Properties

/* tokens.css */
:root {
--color-primary: #1a1a1a;
--color-accent: #ff6b35;
--color-surface: #ffffff;
--font-display: 'Exo 2', sans-serif;
--font-body: 'Crimson Text', serif;
--ease-smooth: cubic-bezier(0.65, 0, 0.35, 1);
--duration-page: 1000ms;
--duration-quiet: 500ms;
}

3.4 Fresh & Active Works Pipeline

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  GitHub API │────▶│  Build-time  │────▶│  Astro SSG  │
│  App Store  │     │  Fetch Script│     │  Static JSON│
└─────────────┘     └──────────────┘     └─────────────┘
│
▼
┌──────────────┐
│  .cache/     │
│  fresh.json  │
└──────────────┘

Sync Strategy:
1. Build-time fetch: Script runs during astro build
2. Cache file: Store results in .cache/fresh.json
3. Fallback: If API fails, use cached data
4. Incremental: Only fetch changed items (ETags)
5. Manual trigger: Can re-run via webhook or cron

OPTIONAL (bigger/riskier): Serverless scheduled function (Vercel Cron) for real-time updates

  ---
3.5 SEO Migration Plan

URL Mapping
┌─────────────────────────────┬──────────────────────┬──────────────┐
│           Old URL           │       New URL        │    Status    │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /                           │ /                    │ Same         │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /en/                        │ /                    │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /about/                     │ /about/              │ Same         │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /en/about/                  │ /about/              │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /web/                       │ /services/web/       │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /marketing/                 │ /services/marketing/ │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /programming/               │ /services/custom/    │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /portfolio/                 │ /work/               │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /portfolio/portfolio-*.html │ /work/[slug]/        │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /breef/                     │ /brief/              │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /calc/                      │ /calculator/         │ Redirect 301 │
├─────────────────────────────┼──────────────────────┼──────────────┤
│ /contacts/                  │ /contact/            │ Redirect 301 │
└─────────────────────────────┴──────────────────────┴──────────────┘
French URLs:
- /fr/ → French homepage
- /fr/services/... → French service pages
- Language prefix pattern throughout

Redirects Implementation

// astro.config.mjs
export default defineConfig({
redirects: {
'/en': '/',
'/en/[...slug]': '/[...slug]',
'/web': '/services/web',
'/marketing': '/services/marketing',
'/programming': '/services/custom',
'/portfolio': '/work',
'/portfolio/portfolio-[slug].html': '/work/[slug]',
'/breef': '/brief',
'/calc': '/calculator',
'/contacts': '/contact',
}
});

Meta / OG / Structured Data

  <!-- BaseLayout.astro -->
  <head>
    <title>{seo.title} | Mad Masters</title>
    <meta name="description" content={seo.description} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- OG -->
    <meta property="og:title" content={seo.title} />
    <meta property="og:description" content={seo.description} />
    <meta property="og:image" content={seo.ogImage} />
    <meta property="og:type" content="website" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />

    <!-- JSON-LD -->
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Mad Masters",
      "url": "https://madmasters.pro"
    })} />
  </head>

Sitemap & Robots

// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
site: 'https://madmasters.pro',
integrations: [
sitemap({
i18n: {
defaultLocale: 'en',
locales: { en: 'en', fr: 'fr' }
}
})
]
});

# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://madmasters.pro/sitemap-index.xml

No Ranking Loss Strategy

1. Pre-launch: Submit sitemap to Google Search Console
2. 301 redirects: All old URLs redirect to new
3. Canonical tags: Every page has self-referencing canonical
4. Hreflang: Proper language alternates
5. No noindex: Ensure all pages are indexable
6. Monitor: Set up GSC alerts for crawl errors
7. Fetch as Google: Request re-indexing of key pages

  ---
PHASE 4: SCAFFOLD CODE

I'm ready to create the initial scaffold when you approve this plan. The scaffold will include:

1. Astro project setup with:
   - TypeScript configuration
   - Tailwind CSS
   - i18n routing (EN + FR)
   - Vercel adapter
2. FullPageScroll component (React island):
   - Exact behavior matching current site
   - Touch support
   - Keyboard navigation
   - Responsive fallback
3. HeroVideo component:
   - Poster fallback
   - Reduced motion respect
   - iOS Safari handling
4. Base layouts and pages:
   - Homepage structure with 5 sections
   - Navigation component
   - Language toggle
5. Fresh Works data integration:
   - GitHub API client
   - App Store scraping strategy
   - Build-time sync script
6. Deployment config:
   - vercel.json
   - Environment variables template

  ---
Questions Before Proceeding

Before I scaffold the code, I need clarity on a few points:

1. Fresh & Active Works sources: Can you provide the GitHub username/org and any App Store app IDs to integrate?
2. Content migration: Should I extract and migrate all current content now, or create placeholder content first?
3. French translations: Do you have French content ready, or should I structure it for later translation?
4. Video assets: Should I re-encode the current video.mp4 to WebM + optimized MP4, or will you provide new assets?
5. Design refresh: Are you keeping the current visual design (colors, typography), or is this also a visual redesign?