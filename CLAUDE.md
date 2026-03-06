# TeachersBoost — Claude Code Instructions

TeachersBoost is a TpT (Teachers Pay Teachers) seller SaaS tool. It helps TpT sellers find low-competition keywords, analyze their shop, and optimize product listings.

**Live URL**: https://teachersboost.vercel.app
**Repo**: https://github.com/teacherprepsofficial-cloud/teachersboost
**Domain target**: teachersboost.com (point to Vercel when ready)

---

## Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: NextAuth.js (credentials + Google OAuth), JWT sessions
- **Email**: Resend (`noreply@teachersboost.com`) for email verification
- **Scraping**: fetch + regex (no Puppeteer — TpT doesn't block aggressively)
- **Payments**: Stripe (not yet integrated)
- **Deployment**: Vercel (`vercel --prod` to deploy)

---

## Design System

- **Border radius**: `rounded-[5px]` EVERYWHERE — no exceptions, no `rounded-lg`, no `rounded-xl`
- **Primary accent**: Rose/red — `bg-rose-600`, `text-rose-600`
- **Background**: `#F1F5F9` (dashboard pages)
- **Sidebar bg**: white with `border-r border-gray-200` (light sidebar)
- **Font style**: Bold, analytical, authoritative — like Ahrefs. NOT rounded/bubbly/vibe-coded.
- **Tone**: Strong, data-driven, built for non-technical teachers who sell on TpT
- **Dark mode**: DISABLED — app forces light mode in `globals.css` via `prefers-color-scheme: dark` override

---

## Plan Tiers & Limits

| Plan    | Keyword Searches/week | Save Keywords |
|---------|----------------------|---------------|
| free    | 3                    | 0             |
| starter | unlimited            | 50            |
| pro     | unlimited            | 100           |
| admin   | unlimited            | unlimited     |

Admin accounts: `teachersboost@gmail.com`, `elliottzelinskas@gmail.com`
→ Set via `scripts/seed-admin.ts`

---

## File Structure (Key Files)

```
app/
  (dashboard)/
    keywords/page.tsx              # Keyword research page
    keywords/[keyword]/page.tsx    # Keyword breakdown (meter, competition links, matching keywords)
    saved-keywords/page.tsx        # Saved/bookmarked keywords list
    trending/page.tsx              # Trending keywords page (Algolia live feed)
    niche-finder/page.tsx          # Niche Finder tool
    title-generator/page.tsx       # Placeholder (not built)
    description-generator/page.tsx # Placeholder (not built)
    settings/page.tsx
    layout.tsx                     # Uses DashboardShell (wraps Sidebar + TopBar + MobileBottomNav)
  onboarding/page.tsx              # 3-step onboarding (goal, grade levels, store stage)
  api/
    scrape/keywords/route.ts           # Main keyword search API (rate-limited)
    scrape/keyword-breakdown/route.ts  # Full breakdown — NO auth required (public read-only)
    keywords/save/route.ts             # GET list | POST save | DELETE unsave
    keywords/save-full/route.ts        # GET full saved keyword objects (with scores)
    dashboard/opportunities/route.ts   # GET trending keywords — NO auth required
    onboarding/route.ts                # Save onboarding answers

components/
  DashboardShell.tsx               # Client shell: TopBar + Sidebar + MobileBottomNav + layout
  TopBar.tsx                       # Top bar — desktop full, mobile: logo left + hamburger right
  Sidebar.tsx                      # Light sidebar (desktop drawer + mobile drawer with nav links)
  MobileBottomNav.tsx              # Mobile-only fixed bottom nav (5 tool icons)
  KeywordTable.tsx                 # Sortable keyword results table
  FilterPanel.tsx                  # TpT-style pill dropdowns for keyword filters (desktop only)
  FeedbackWidget.tsx               # Floating feedback button (desktop only)

lib/
  scraper.ts                       # All TpT scraping functions
  tpt-filters.ts                   # Filter groups/options for FilterPanel
  auth.ts                          # NextAuth config
  db.ts                            # MongoDB connection

models/
  User.ts                          # User model (plan, onboarding fields)
  SavedKeyword.ts                  # Saved keywords (userId + keyword + scores)
  KeywordSearch.ts                 # Cache layer for keyword scrape results

app/globals.css                    # Forces light mode, global input text color #111827
```

---

## Mobile Layout Architecture

The app uses a **mobile-first responsive design** introduced in March 2026:

### DashboardShell (`components/DashboardShell.tsx`)
- Client component that wires TopBar + Sidebar + MobileBottomNav together
- Manages mobile drawer open/close state
- Main content gets `pb-16 md:pb-0` to clear the bottom nav bar
- Dashboard layout (`app/(dashboard)/layout.tsx`) renders only `<DashboardShell>`

### TopBar (`components/TopBar.tsx`)
- **Mobile**: logo left + red hamburger button right, all other content hidden
- **Desktop**: logo (w-64) + stats + page title + nav links + auth
- Accepts `onMobileMenuToggle` prop to open the sidebar drawer

### MobileBottomNav (`components/MobileBottomNav.tsx`)
- Fixed bottom bar, `md:hidden`
- 5 icons: Keywords (`/keywords`), Trending (`/trending`), Niche (`/niche-finder`), Titles (`/title-generator`), Description (`/description-generator`)

### Sidebar (`components/Sidebar.tsx`)
- Desktop: `hidden md:flex` fixed left drawer
- Mobile: slides in from left, triggered by TopBar hamburger
- Mobile drawer includes extra section: Pricing, Contact, About, My Account links

### Mobile-only UI rules (applied throughout)
- `FilterPanel` hidden on mobile (`hidden md:block` wrapper in keywords/page.tsx)
- `FeedbackWidget` hidden on mobile (`hidden md:block` on the button)
- Trending page: "Full Research Tool" button hidden on mobile
- Niche Finder: suggestion chips hidden on mobile, input text forced dark
- Keyword Explorer search bar: stacked layout on mobile (input above, button below), button reads "Search Keywords"
- Keyword Explorer placeholder: `"3rd grade math review spiral with answers"` on both mobile and desktop
- Keywords page subtitle: stacked emoji lines on mobile (`🔎 Find keywords / 📈 Optimize listings / 🚀 Boost TpT sales`)
- Keyword breakdown page: Save Keyword button stacked below keyword title on mobile; "View on TpT" stacked below text on mobile; Competition Score + Results columns hidden in Matching Keywords table on mobile
- KeywordTable (search results): Competition Score column hidden on mobile
- Saved Keywords empty state: shortened to "Save keywords here" on mobile
- `globals.css`: dark mode overridden to keep light theme; `input/textarea/select` forced to `color: #111827` globally

---

## Route Groups

- `(dashboard)` — pages render at root URL (e.g. `/keywords` NOT `/dashboard/keywords`)
- `(auth)` — login, signup
- `(marketing)` — landing page at `/`

---

## Scraper Architecture (`lib/scraper.ts`)

### TpT HTML Scraping
- **Result count**: regex `"totalCount":(\d+)` from TpT browse HTML
- **Competition score**: `resultCount / 1000` (9,505 results → 9.5)
- **isRocket**: `resultCount < 1000` (hidden gem)

### Smart Long-Tail Generation (`scrapeKeywordLongTail`)
- Detects product type from keyword (13 types: bulletin-board, worksheet, activities, lesson-plan, task-cards, anchor-chart, centers, game, craft, coloring, clip-art, poster, flash-cards, generic)
- Appends contextual suffixes per type (e.g. bulletin boards get seasonal/decor suffixes, NOT "worksheets")
- Also expands grade levels if no grade detected
- Returns up to 10 long-tail variants, grade expansions first

### Algolia API (TpT autocomplete)
- **Endpoint**: `https://sbekgjsj8m-3.algolianet.com/1/indexes/*/queries`
- **App ID**: `SBEKGJSJ8M`
- **API Key**: `ce17b545c6ba0432cf638e0c29ee64ef`
- **Index**: `Resource Suggestions`
- Returns up to 5 trending keyword suggestions from TpT's own autocomplete

### Sort Orders for Product Links
TpT URL params: `order=Relevance`, `order=Rating`, `order=Price-Asc`, `order=Price-Desc`, `order=Most-Recent`

### Price Sanity Filter
Products must be `$0.50 ≤ price ≤ $25` — filters metadata noise from TpT HTML.

---

## Keyword Breakdown Page (`/keywords/[keyword]`)

Layout (grid):
- **Left (5 cols)**: `CompetitionMeter` SVG gauge
- **Right (7 cols)**:
  - Products Containing This Keyword (big number)
  - Keyword Competition (4 product links: Top Ranking, Top Rated, Lowest Price, Most Recent)
- Below grid: "Research all X products on TpT" bar + View on TpT button
- Below bar: **Matching Keywords table** — long-tail variations with live scores

### Competition Meter (INVERTED)
- Low score = LOW competition = GOOD = needle points RIGHT = large fill
- `pct = 1 - Math.min(score, MAX) / MAX`
- Fill draws from RIGHT: `arc(1 - pct, 1)`
- Score number displayed BELOW the SVG arc (not inside)
- Labels: "HIGH" on left end, "LOW" on right end

### Opportunity Grade Thresholds
- `< 1`: 🚀 Hidden Gem (green)
- `< 5`: 🟡 Moderate (yellow)
- `< 10`: 🟠 Crowded (orange)
- `≥ 10`: 🔴 Competitive (red)

### Auth on Breakdown API
- `/api/scrape/keyword-breakdown` does NOT require login — public read-only scrape
- `/api/dashboard/opportunities` does NOT require login — defaults to teacher-seller keywords

---

## Trending Keywords Page (`/trending`)

- Fetches from `/api/dashboard/opportunities` (Algolia, no auth required)
- Lists keywords as clickable rows → each links to `/keywords/[keyword]`
- "Full Research Tool" button hidden on mobile

---

## Saved Keywords

- Frontend: bookmark icon on table rows and breakdown page header
- API enforces plan limits — **no frontend plan gate** (was a bug causing admin to get blocked)
- `SavedKeyword` model: `{ userId, keyword, competitionScore, resultCount, timestamps }`
- Unique index on `{ userId, keyword }`
- `/saved-keywords` page shows legal-pad notebook UI with trash icon per row

---

## Known Issues / Limitations

- **TpT product scraping is unreliable** — TpT renders via React hydration; JSON parsing from HTML is best-effort. `scrapeFirstProduct()` may return `null` for some sort orders, in which case it falls back to a TpT search URL.
- **Pricing data unreliable** — scraper can pick up metadata prices instead of actual product prices. Price sanity filter ($0.50–$25) reduces noise but doesn't eliminate it.
- **Breakdown page is slow** — scrapes 14 long-tail keywords + 4 sort orders + main keyword in parallel (~15–20s).

---

## Pending Features (Not Built Yet)

- [ ] Stripe integration (Starter ~$9.99/mo, Pro ~$14.99/mo)
- [ ] Shop Optimizer (paste TpT store URL → shop analytics)
- [ ] Title Generator (Claude API)
- [ ] Description Generator (Claude API)
- [ ] Pricing Calculator
- [ ] Admin panel (`/admin/feedback`)
- [ ] Connect `teachersboost.com` domain to Vercel

---

## Deploy

```bash
cd /Users/elliottzelinskas/teachersboost && vercel --prod
```

Always deploys to https://teachersboost.vercel.app (aliased).
