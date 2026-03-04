# TeachersBoost Setup Guide

## Prerequisites

1. **Node.js 18+** - Install from nodejs.org
2. **MongoDB** - Install locally or use MongoDB Atlas cloud (https://www.mongodb.com/cloud/atlas)
3. **API Keys**:
   - Anthropic Claude API key (for Phase 3)
   - Stripe API keys (for Phase 5)
   - Google OAuth credentials (optional, for social login)

## Local Setup

### 1. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# macOS:
brew install mongodb-community
brew services start mongodb-community

# Verify it's running:
mongosh
> show dbs
> exit()
```

**Option B: MongoDB Atlas Cloud**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/teachersboost?retryWrites=true&w=majority`
4. Update MONGODB_URI in `.env.local`

### 2. Environment Variables

Update `.env.local` with your values:

```env
MONGODB_URI=mongodb://localhost:27017/teachersboost
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-... (Phase 3+)
STRIPE_PUBLIC_KEY=pk_test_... (Phase 5+)
STRIPE_SECRET_KEY=sk_test_... (Phase 5+)
GOOGLE_CLIENT_ID=... (optional)
GOOGLE_CLIENT_SECRET=... (optional)
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Phase 1 - Foundation (Complete ✓)

- [x] Next.js 14 setup
- [x] MongoDB models (User, KeywordSearch, Product, Shop, Feedback)
- [x] NextAuth authentication
- [x] Landing page
- [x] Auth pages (login/signup)
- [x] Dashboard layout with sidebar
- [x] Freemium system
- [x] Middleware protection
- [x] Feedback widget

## Phase 2 - Scraper & Keyword Tool (In Progress)

- [x] Puppeteer scraper library
- [x] Keyword research API
- [x] Sortable keyword table
- [ ] Top products drill-down
- [ ] Shop analysis page
- [ ] Shop scraper API

## Phase 3 - AI Generators (TODO)

- [ ] Title generator with Claude API
- [ ] Description generator
- [ ] API routes for both

## Phase 4 - Shop & Pricing (TODO)

- [ ] Shop optimizer complete
- [ ] Pricing calculator
- [ ] Competitor analysis

## Phase 5 - Payments & Polish (TODO)

- [ ] Stripe checkout
- [ ] Webhook handler
- [ ] Upgrade modal
- [ ] Deployment to Vercel

## Testing the Keyword Scraper

```bash
# 1. Make sure MongoDB is running
mongosh
> db.createCollection('keywordsearches')
> exit()

# 2. Run dev server
npm run dev

# 3. Create test account at http://localhost:3000/signup

# 4. Go to http://localhost:3000/dashboard/keywords

# 5. Search for a keyword like "fractions"
```

The scraper will:
1. Check MongoDB cache (24h TTL)
2. If cache miss, scrape TpT's public site using Puppeteer
3. Extract result count and suggestions
4. Calculate competition score
5. Show 🚀 emoji if < 1000 results (low competition)

## Troubleshooting

**"ECONNREFUSED 127.0.0.1:27017"**
- MongoDB not running
- macOS: `brew services start mongodb-community`

**"Cannot find module 'puppeteer'"**
- Run `npm install puppeteer`

**"Scraper returns 0 results"**
- TpT HTML structure may have changed
- Check browser dev tools to verify selectors

**"NextAuth errors on signup"**
- Check NEXTAUTH_SECRET is set (not empty)
- Check NEXTAUTH_URL matches your domain

## Next Steps

1. **Test Phase 2** - Get keyword scraping working
2. **Phase 3** - Add Claude API keys and test AI generators
3. **Phase 5** - Get Stripe keys and test payments
4. **Deploy** - Set up Vercel, update env vars there
