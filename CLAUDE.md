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
- **Primary**: Purple `#7C3AED` / `bg-purple-600`
- **Background**: `#F1F5F9` (dashboard pages)
- **Sidebar bg**: `#0f172a` (dark navy)
- **Font style**: Bold, analytical, authoritative — like Ahrefs. NOT rounded/bubbly/vibe-coded.
- **Tone**: Strong, data-driven, built for non-technical teachers who sell on TpT

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
    shop-optimizer/page.tsx        # Placeholder (not built)
    title-generator/page.tsx       # Placeholder (not built)
    description-generator/page.tsx # Placeholder (not built)
    pricing-calculator/page.tsx    # Placeholder (not built)
    settings/page.tsx
  onboarding/page.tsx              # 3-step onboarding (goal, grade levels, store stage)
  api/
    scrape/keywords/route.ts       # Main keyword search API
    scrape/keyword-breakdown/route.ts  # Full breakdown (meter data + competition links)
    keywords/save/route.ts         # GET list | POST save | DELETE unsave
    keywords/save-full/route.ts    # GET full saved keyword objects (with scores)
    onboarding/route.ts            # Save onboarding answers

components/
  Sidebar.tsx                      # Dark sidebar, menu items
  KeywordTable.tsx                 # Sortable keyword results table
  FeedbackWidget.tsx               # Floating feedback button

lib/
  scraper.ts                       # All TpT scraping functions
  auth.ts                          # NextAuth config
  db.ts                            # MongoDB connection

models/
  User.ts                          # User model (plan, onboarding fields)
  SavedKeyword.ts                  # Saved keywords (userId + keyword + scores)
  KeywordSearch.ts                 # Cache layer for keyword scrape results
```

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

### Algolia API (TpT autocomplete)
- **Endpoint**: `https://sbekgjsj8m-3.algolianet.com/1/indexes/*/queries`
- **App ID**: `SBEKGJSJ8M`
- **API Key**: `ce17b545c6ba0432cf638e0c29ee64ef`
- **Index**: `Resource Suggestions`
- Returns up to 5 trending keyword suggestions from TpT's own autocomplete

### Sort Orders for Product Links
TpT URL params: `order=Relevance`, `order=Rating`, `order=Price-Asc`, `order=Price-Desc`, `order=Most-Recent`

### `scrapeFirstProduct(keyword, order)`
Fetches the #1 product from a given sort order. Returns `{ title, url }` or `null`.
Used in keyword breakdown to show actual product links.

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

---

## Trending Keywords Section

On keyword results page, shown after search. Redesigned as:
- **Green gradient header bar** ("Trending on TpT Right Now")
- **Grid of cards** — each shows keyword, competition score, opportunity grade badge
- Data source: Algolia API, each trending keyword is also scraped for competition score

---

## Saved Keywords

- Frontend: bookmark icon on table rows and breakdown page header
- API enforces plan limits — **no frontend plan gate** (was a bug causing admin to get blocked)
- `SavedKeyword` model: `{ userId, keyword, competitionScore, resultCount, timestamps }`
- Unique index on `{ userId, keyword }`
- `/saved-keywords` page shows table with trash icon to remove

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
vercel --prod
```

Always deploys to https://teachersboost.vercel.app (aliased).
