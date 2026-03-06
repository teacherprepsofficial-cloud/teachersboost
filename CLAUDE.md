# TeachersBoost — Claude Code Instructions

TeachersBoost is a TpT (Teachers Pay Teachers) seller SaaS tool. It helps TpT sellers find low-competition keywords, optimize product listings, and grow their store.

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
- **Payments**: Stripe — subscriptions, webhooks, billing portal, plan switching
- **Deployment**: Vercel (`vercel --prod` to deploy)

---

## Design System

- **Border radius**: `rounded-[5px]` EVERYWHERE — no `rounded-lg`, no `rounded-xl`
- **Primary accent**: Rose/red — `bg-rose-600`, `text-rose-600`
- **Background**: `#F1F5F9` (dashboard pages)
- **Sidebar bg**: white with `border-r border-gray-200`
- **Font style**: Bold, analytical, authoritative — like Ahrefs. NOT rounded/bubbly.
- **Tone**: Strong, data-driven, built for non-technical teachers who sell on TpT
- **Dark mode**: DISABLED — app forces light mode in `globals.css`

---

## Plan Tiers & Limits

| Plan    | Keyword Searches/week | AI Title/Desc per month | Save Keywords |
|---------|----------------------|------------------------|---------------|
| free    | 3                    | 0                      | 0             |
| starter | unlimited            | 20 each                | 50            |
| pro     | unlimited            | 75 each                | 100           |
| admin   | unlimited            | unlimited              | unlimited     |

Admin accounts: `teachersboost@gmail.com`, `elliottzelinskas@gmail.com`
→ Set via `scripts/seed-admin.ts`

---

## Stripe Integration

### Price ID Environment Variables
```
STRIPE_PRICE_STARTER_MONTHLY
STRIPE_PRICE_STARTER_YEARLY
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXTAUTH_URL   # used by portal route for return_url
```

**CRITICAL**: `switch-plan/route.ts` and `checkout/route.ts` both use the same env var names above. Never use different naming conventions across these files.

### Stripe API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stripe/checkout` | POST | Creates Stripe Checkout session for new subscriptions. Expects `{ plan: 'starter'|'pro', billing: 'monthly'|'annual' }` |
| `/api/stripe/switch-plan` | POST | Upgrades/downgrades between paid plans. Expects `{ plan: 'starter_monthly'|'pro_annual'|etc }`. Updates MongoDB directly + updates subscription metadata so webhook stays consistent. |
| `/api/stripe/cancel` | POST | Sets `cancel_at_period_end: true`. User keeps access until period end. Does NOT downgrade immediately. |
| `/api/stripe/portal` | POST | Creates Stripe Billing Portal session (update card, view invoices). Returns `{ url }`. |
| `/api/stripe/webhook` | POST | Handles 4 events (see below) |

### Webhook Events Handled
1. `checkout.session.completed` — sets plan + stripeSubscriptionId + renewalDate + clears cancelledAt
2. `customer.subscription.updated` — updates plan + renewalDate + cancelAtPeriodEnd
3. `customer.subscription.deleted` — downgrades to free, clears subscription fields, sets cancelledAt
4. `invoice.payment_failed` — logs warning (email not yet wired)

### Cancel Flow (Important — no immediate downgrade)
- User clicks Cancel → `cancel_at_period_end: true` set in Stripe and MongoDB
- User sees amber warning: "Cancels [date] — access remains until then"
- Switch Plan + Cancel sections are hidden while `cancelAtPeriodEnd = true`
- When billing period ends → Stripe fires `customer.subscription.deleted` → webhook downgrades to free
- **NEVER call `stripe.subscriptions.cancel()` for user-initiated cancels** — that's immediate. Only use it for account deletion.

### Plan Switch Flow
- `switch-plan` route: retrieves subscription, swaps price, updates metadata, writes new plan + renewalDate directly to MongoDB
- Also calls `await update({ plan: newPlan })` in the frontend to refresh the JWT so the plan badge updates immediately without requiring re-login

---

## My Account Page (`/settings`)

Self-service page with 7 sections:

1. **Profile** — name, email (read-only), timezone → PATCH `/api/user/settings`
2. **Subscription** — plan badge + usage bars + "Manage Billing" (Stripe portal) for paid users
3. **Upgrade** (free users only) — monthly/annual billing toggle + Boost/Pro checkout buttons
4. **Switch Plan** (paid, non-cancelled users) — upgrade starter→pro or downgrade pro→starter
5. **Cancel Subscription** (paid, non-cancelled users) — at-period-end cancel with confirmation step
6. **Security** — password change form (credentials users only; Google users see "managed by Google" message). Shows loading skeleton until `hasPassword` is determined from API.
7. **Danger Zone** — delete account. Requires typing `"delete my account"` exactly. Calls DELETE `/api/user/delete-account` which: cancels Stripe immediately + deletes User + SavedKeywords + Testimonials + Feedback.

### Key rules for settings page
- `usage` API (`/api/user/usage`) returns: plan, cancelAtPeriodEnd, subscriptionRenewalDate, hasPassword + all usage stats
- Plan badge reads from `session?.user?.plan` (JWT) — after plan switch, call `await update({ plan })` to keep it fresh
- `hasPassword` defaults to `null` (not `true`) while loading — prevents Google users from briefly seeing the password form

---

## User Model (`models/User.ts`) — Key Fields

```typescript
plan: 'free' | 'starter' | 'pro' | 'admin'
stripeCustomerId?: string
stripeSubscriptionId?: string
subscriptionRenewalDate?: Date
cancelledAt?: Date
cancelAtPeriodEnd?: boolean   // true = cancel scheduled at period end
password?: string             // undefined for Google OAuth users
timezone: string              // default 'America/New_York'
sellerType?: 'teacher-seller' | 'seller-to-sellers'
```

---

## Auth (`lib/auth.ts`) — JWT Fields

JWT and session expose: `id`, `plan`, `onboardingCompleted`, `timezone`, `sellerType`

Update trigger handles: `timezone`, `sellerType`, `name`, `onboardingCompleted`, `plan`

To refresh session after a plan change:
```typescript
await update({ plan: 'pro' })  // triggers JWT callback with trigger='update'
```

---

## File Structure (Key Files)

```
app/
  (dashboard)/
    keywords/page.tsx              # Keyword research + always-visible TpT Trending Keywords table
    keywords/[keyword]/page.tsx    # Keyword breakdown (meter, competition links, matching keywords)
    saved-keywords/page.tsx        # Saved/bookmarked keywords list
    trending/page.tsx              # Trending keywords page (Algolia live feed)
    niche-finder/page.tsx          # Niche Finder tool
    title-generator/page.tsx       # Placeholder
    description-generator/page.tsx # Placeholder
    feedback/page.tsx              # Feedback submission form (type selector + textarea)
    settings/page.tsx              # Full My Account page (7 sections, see above)
    layout.tsx                     # Uses DashboardShell
  onboarding/page.tsx
  api/
    auth/signup/route.ts               # Creates user + sends verification email. Min password: 8 chars.
    auth/verify-email/route.ts         # Verifies email token
    scrape/keywords/route.ts           # Main keyword search (rate-limited by plan)
    scrape/keyword-breakdown/route.ts  # Full breakdown — NO auth required
    keywords/save/route.ts             # GET list | POST save | DELETE unsave
    keywords/save-full/route.ts        # GET full saved keyword objects with scores
    dashboard/opportunities/route.ts   # GET trending keywords — NO auth required
    dashboard/blog/route.ts            # GET TpT blog posts (RSS, cached 6h)
    stripe/checkout/route.ts           # New subscription checkout
    stripe/switch-plan/route.ts        # Upgrade/downgrade between paid plans
    stripe/cancel/route.ts             # Cancel at period end
    stripe/portal/route.ts             # Stripe Billing Portal
    stripe/webhook/route.ts            # Stripe webhook handler
    user/settings/route.ts             # PATCH name/timezone/sellerType
    user/usage/route.ts                # GET usage stats + cancelAtPeriodEnd + hasPassword
    user/change-password/route.ts      # POST change password (credentials users only)
    user/delete-account/route.ts       # DELETE account (cancels Stripe + deletes all records)
    feedback/route.ts                  # POST feedback submission
    onboarding/route.ts                # POST save onboarding answers

components/
  DashboardShell.tsx    # Client shell: TopBar + Sidebar + MobileBottomNav + layout wiring
  TopBar.tsx            # Mobile: logo + hamburger. Desktop: full bar.
  Sidebar.tsx           # Desktop fixed left + mobile slide-in drawer
  MobileBottomNav.tsx   # Mobile-only fixed bottom nav (5 icons)
  KeywordTable.tsx      # Sortable keyword results table (Competition Score hidden on mobile)
  FilterPanel.tsx       # TpT-style pill dropdowns for keyword filters (desktop only)
  FeedbackWidget.tsx    # Floating feedback button (desktop only, hidden on mobile)
  UpgradeModal.tsx      # Modal shown when rate limit hit
  SignupPromptModal.tsx # Modal shown when unauthenticated user tries to search

lib/
  scraper.ts    # All TpT scraping functions
  tpt-filters.ts
  auth.ts       # NextAuth config
  db.ts         # MongoDB connection

models/
  User.ts           # Main user model
  SavedKeyword.ts   # { userId, keyword, competitionScore, resultCount }
  KeywordSearch.ts  # Cache layer for keyword scrape results
  DailyKeywords.ts  # Cached trending keywords (24h TTL)
  BlogCache.ts      # Cached TpT blog posts (6h TTL)
  Testimonial.ts
  Feedback.ts

app/globals.css    # Forces light mode, global input color #111827
```

---

## Mobile Layout Architecture

### DashboardShell (`components/DashboardShell.tsx`)
- Client component that wires TopBar + Sidebar + MobileBottomNav
- Manages mobile drawer open/close state (`mobileOpen`)
- Main content: `pb-16 md:pb-0` to clear bottom nav bar

### TopBar (`components/TopBar.tsx`)
- **Mobile**: logo left + red hamburger button right only (`md:hidden`)
- **Desktop**: full bar (`hidden md:flex`)
- Accepts `onMobileMenuToggle` prop

### MobileBottomNav (`components/MobileBottomNav.tsx`)
- Fixed bottom bar, `md:hidden`
- 5 icons: Keywords, Niche, Titles, Description, Saved

### Sidebar (`components/Sidebar.tsx`)
- Desktop: `hidden md:flex` fixed left drawer (w-64)
- Mobile: slides in from left, z-50, triggered by TopBar hamburger
- Mobile drawer has extra section: Pricing, Contact, About, My Account
- `mobileOnly: true` flag on menuItems (e.g. Send Feedback) — hidden on desktop

### Mobile-only UI rules
- FilterPanel hidden: `hidden md:block` wrapper
- FeedbackWidget hidden: `hidden md:block`
- Keyword Explorer: stacked search bar on mobile, button reads "Search Keywords"
- Keyword Explorer placeholder: `"3rd grade math review spiral with answers"`
- Keywords page subtitle: emoji stacked lines on mobile
- KeywordTable: Competition Score column hidden on mobile (`hidden md:table-cell`)
- Keyword breakdown: Save button + View on TpT stacked on mobile; Competition Score + Results columns hidden in Matching Keywords table
- Saved Keywords empty state: shortened on mobile

---

## Scraper Architecture (`lib/scraper.ts`)

### TpT HTML Scraping
- **Result count**: regex `"totalCount":(\d+)` from TpT browse HTML
- **Competition score**: `resultCount / 1000`
- **isRocket**: `resultCount < 1000`

### Algolia API (TpT autocomplete)
- **Endpoint**: `https://sbekgjsj8m-3.algolianet.com/1/indexes/*/queries`
- **App ID**: `SBEKGJSJ8M`
- **API Key**: `ce17b545c6ba0432cf638e0c29ee64ef`
- **Index**: `Resource Suggestions`

### Opportunity Grade Thresholds (keyword breakdown)
- `≤ 1`: 🚀 Excellent (green)
- `≤ 25`: 🟢 Easy (green)
- `≤ 50`: 🟠 Medium (orange)
- `≤ 75`: 🔴 Hard (red)
- `> 75`: ⚫ Very Hard (slate)

### TpT Trending Table (keywords homepage)
Grade thresholds for the homepage trending table:
- `≤ 1`: 🚀 Excellent
- `≤ 25`: 🟢 Easy
- `≤ 50`: 🟠 Medium
- `≤ 75`: 🔴 Hard
- `> 75`: ⚫ Very Hard

---

## Keyword Breakdown Page (`/keywords/[keyword]`)

- Left (5 cols): `CompetitionMeter` SVG gauge — INVERTED (low score = needle right = good)
- Right (7 cols): result count + 4 product links
- Below: "Research all X products" bar + Matching Keywords table
- Competition Meter: `pct = 1 - Math.min(score, MAX) / MAX`, fill draws from RIGHT
- Labels: "HIGH" left end, "LOW" right end

---

## Known Issues / Limitations

- **TpT product scraping is unreliable** — `scrapeFirstProduct()` may return `null`; falls back to TpT search URL
- **Pricing data unreliable** — price sanity filter ($0.50–$25) reduces noise
- **Breakdown page is slow** — ~15–20s for full scrape
- **`invoice.payment_failed` webhook** — logs only, no email sent to user yet

---

## Pending Features

- [ ] Title Generator (Claude API)
- [ ] Description Generator (Claude API)
- [ ] Shop Optimizer (paste TpT store URL → shop analytics)
- [ ] Email on payment failure (`invoice.payment_failed` webhook)
- [ ] Connect `teachersboost.com` domain to Vercel

---

## Deploy

```bash
cd /Users/elliottzelinskas/teachersboost && vercel --prod
```

Always deploys to https://teachersboost.vercel.app (aliased).
