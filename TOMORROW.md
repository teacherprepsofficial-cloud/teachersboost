# Tomorrow's Work — TeachersBoost Tools

## Context
TeachersBoost MVP is live at https://teachersboost.vercel.app with:
- ✅ Keyword Research (`/keywords` + `/keywords/[keyword]`)
- ✅ Saved Keywords (`/saved-keywords`)
- ✅ Dashboard with trending keywords + TpT blog feed
- ✅ Settings (timezone, seller type, name)

The following tools have placeholder pages but are NOT built yet.
They were removed from the sidebar on 2026-03-04 until built.

## Tools to Build (in order)

### 1. Shop Optimizer (`/shop-optimizer`)
- User pastes their TpT store URL
- Scrape with `scrapeShop(shopUrl)` from `lib/scraper.ts` → returns `{ storeName, rating, ratingCount, followers, productCount }`
- Display store analytics dashboard

### 2. Title Generator (`/title-generator`)
- User enters a keyword/topic
- Use Claude API (`@anthropic-ai/sdk`) to generate 5 SEO-optimized TpT product titles
- Follow TpT title best practices (keyword first, grade level, format)

### 3. Description Generator (`/description-generator`)
- User enters product title + keywords
- Use Claude API to generate a full TpT product description
- Structured: hook, what's included, how to use, standards alignment

### 4. Pricing Calculator (`/pricing-calculator`)
- User enters keyword
- Use `scrapeTopProducts()` from `lib/scraper.ts` to get competitor prices
- Show price distribution, recommend optimal price point

## When Ready to Add Back to Sidebar
Edit `components/Sidebar.tsx` — add these back to `menuItems`:
```ts
{ href: '/shop-optimizer',        label: 'Shop Optimizer',        icon: Store },
{ href: '/title-generator',       label: 'Title Generator',       icon: Type },
{ href: '/description-generator', label: 'Description Generator', icon: FileText },
{ href: '/pricing-calculator',    label: 'Pricing Calculator',    icon: DollarSign },
```
And restore the imports: `Store, Type, FileText, DollarSign` from `lucide-react`.

## Deploy
```bash
cd /Users/elliottzelinskas/teachersboost && vercel --prod
```
