# Mad Masters Implementation Plan

## Current State Assessment

### COMPLETED ✅
- **Stack**: Next.js 14+ App Router with TypeScript
- **Firebase Admin SDK**: Configured in `src/lib/firebase/admin.ts`
- **Firestore Data Models**: Complete types in `src/lib/firebase/types.ts`
- **i18n System**: JSON dictionaries (`en.json`, `fr.json`) with fallback
- **Scroll Engine**: 5-section fullpage scroll with all acceptance criteria
- **Hero Video**: Component with reduced-motion, mobile optimization
- **Admin Auth**: Server-side session verification
- **Orders API**: Validated submission endpoint
- **Public Pages**: Home, About, Services, Work, Contact, Calculator (EN + FR)
- **Styling**: Tailwind CSS configured

### TODO 🔨

---

## 1. Architecture Overview

```
src/
├── app/
│   ├── (public)/              # Public routes (EN)
│   │   ├── page.tsx           # Home
│   │   ├── about/
│   │   ├── services/
│   │   ├── work/
│   │   ├── contact/
│   │   ├── calculator/
│   │   ├── brief/             # TODO: Brief form page
│   │   └── fresh/             # TODO: Fresh & Active Work
│   ├── fr/                    # French locale
│   ├── admin/                 # Protected admin area
│   │   ├── layout.tsx         # Auth guard
│   │   ├── page.tsx           # Dashboard
│   │   ├── case-studies/      # TODO: CRUD
│   │   ├── testimonials/      # TODO: CRUD
│   │   ├── promotions/        # TODO: CRUD
│   │   ├── releases/          # TODO: CRUD
│   │   ├── orders/            # TODO: View/manage
│   │   └── fresh-works/       # TODO: Overrides
│   └── api/
│       ├── auth/              # Auth endpoints
│       ├── orders/            # Order submission
│       ├── admin/             # TODO: CRUD endpoints
│       └── fresh/             # TODO: GitHub/AppStore fetch
├── components/
│   ├── scroll/                # Fullpage scroll system
│   ├── hero/                  # Hero video
│   ├── layout/                # Header, Footer, PageLayout
│   ├── admin/                 # Admin components
│   ├── forms/                 # TODO: Brief, Calculator, Contact forms
│   └── fresh/                 # TODO: Fresh works display
├── lib/
│   ├── firebase/              # Firebase SDK
│   └── fresh-works/           # TODO: GitHub/AppStore APIs
└── i18n/                      # JSON dictionaries
```

---

## 2. Firestore Data Model

### Collections (already defined in types.ts)

| Collection | Purpose | Fields |
|------------|---------|--------|
| `caseStudies` | Portfolio items | locales.en/fr, client, industry, services, metrics, seo, status |
| `testimonials` | Client quotes | locales.en/fr, author, role, company, avatar |
| `promotions` | Offers/promos | locales.en/fr, ctaUrl, startDate, endDate |
| `releases` | Announcements | locales.en/fr, type, date |
| `orders` | Form submissions | type, name, email, data, locale, status |
| `users` | Admin accounts | email, role (admin/editor), displayName |
| `freshWorkCache` | API cache | items[], fetchedAt, error |
| `freshWorkOverrides` | Manual overrides | pinned, hidden, summaryOverride |
| `services` | Service details | locales.en/fr, icon, features |

---

## 3. Implementation Phases

### Phase 1: Admin CRUD (Priority: HIGH)
Build admin management pages for all content types.

**Tasks:**
- [ ] Admin dashboard with stats
- [ ] Case Studies CRUD with image upload
- [ ] Testimonials CRUD
- [ ] Promotions CRUD
- [ ] Releases CRUD
- [ ] Orders list with status management
- [ ] Fresh Works override management

**API Routes needed:**
```
POST/PUT/DELETE /api/admin/case-studies
POST/PUT/DELETE /api/admin/testimonials
POST/PUT/DELETE /api/admin/promotions
POST/PUT/DELETE /api/admin/releases
PATCH /api/admin/orders/[id]
POST/PUT /api/admin/fresh-overrides
```

### Phase 2: Fresh & Active Work (Priority: HIGH)

**GitHub Integration:**
- Fetch repos from organization/user
- Get stars, forks, recent commits, releases
- Cache in Firestore

**App Store Integration:**
- Use iTunes Search API (public, no auth)
- Get app info, version, rating
- Cache results

**Pipeline:**
```typescript
// Cron job or on-demand revalidation
1. Fetch GitHub repos via GitHub API
2. Fetch App Store apps via iTunes Search API
3. Merge with Firestore overrides (pin/hide/edit)
4. Cache to Firestore
5. Serve from cache on public pages
6. Fallback to last cache if API fails
```

**TODO: Need from you:**
- GitHub org/username for repos
- App Store app IDs (bundle IDs)

### Phase 3: Public Forms (Priority: HIGH)

**Brief Form Page** (`/brief`):
- Multi-step wizard
- Project type, budget, timeline
- File upload support (Firebase Storage)
- Validation with Zod

**Calculator** (enhance existing):
- Service selection
- Feature toggles
- Price estimation
- Lead capture

**Contact Form** (enhance existing):
- Simple inquiry form
- Spam protection (honeypot + rate limit)

### Phase 4: SEO & Deployment (Priority: MEDIUM)

**Metadata:**
- Dynamic titles/descriptions per page
- OG images
- JSON-LD for Organization

**Technical SEO:**
- Generate sitemap.xml
- robots.txt
- Canonical URLs
- hreflang for EN/FR

**RU Legacy Handling:**
- Option A: Redirect `/ru/*` to `/` with 301
- Option B: Serve 410 Gone
- Recommendation: 301 redirects (preserves any link equity)

### Phase 5: Playwright Tests (Priority: MEDIUM)

**Scroll Engine Tests:**
```typescript
// tests/scroll.spec.ts
- Wheel scroll moves 1 section
- Animation blocks during scroll
- Quiet period prevents rapid scrolling
- Touch swipe works (threshold 50px)
- Keyboard navigation (Up/Down/Home/End)
- Pagination dots are clickable
- Active dot updates
- Mobile < 600px uses native scroll
- Hash navigation (#2 goes to section 2)
- No looping past first/last
```

---

## 4. Environment Variables

```env
# Firebase Admin (Vercel)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Fresh Works
GITHUB_TOKEN=              # For higher rate limits
GITHUB_ORG=                # Your GitHub org/username

# App Store (no auth needed for iTunes Search API)
APPSTORE_APP_IDS=          # Comma-separated bundle IDs

# Optional: Email notifications
SENDGRID_API_KEY=
NOTIFICATION_EMAIL=
```

---

## 5. Deployment Checklist (Vercel)

- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables
- [ ] Configure custom domain (madmasters.pro)
- [ ] Set up Firebase project
- [ ] Create Firestore indexes
- [ ] Initialize admin user in Firebase Auth
- [ ] Test all forms and admin flows
- [ ] Set up 301 redirects for RU URLs
- [ ] Verify SEO (sitemap, robots, metadata)

---

## 6. Immediate Next Steps

1. **Create admin CRUD pages** - Start with Case Studies
2. **Build Brief form page** - High conversion value
3. **Implement Fresh Works API** - Need GitHub/AppStore IDs
4. **Add Playwright tests** - Verify scroll engine
5. **SEO enhancements** - Metadata, JSON-LD

---

## Questions Needed

Before proceeding with Fresh Works:
1. **GitHub org/username**: For fetching repos
2. **App Store app IDs**: Bundle IDs for your apps (if any)

Everything else can proceed with current information.
