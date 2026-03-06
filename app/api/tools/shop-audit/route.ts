import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { GoogleGenerativeAI } from '@google/generative-ai'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
}

function normalizeStoreUrl(input: string): string {
  const trimmed = input.trim()
  // Already a full URL
  if (trimmed.startsWith('http')) {
    const url = new URL(trimmed)
    // Make sure it's a store URL
    if (!url.pathname.toLowerCase().startsWith('/store/')) {
      throw new Error('Please enter a TpT store URL like teacherspayteachers.com/Store/YourStoreName')
    }
    return `https://www.teacherspayteachers.com${url.pathname}`
  }
  // Just a store name
  if (trimmed.toLowerCase().startsWith('store/')) {
    return `https://www.teacherspayteachers.com/${trimmed}`
  }
  // Bare store name
  return `https://www.teacherspayteachers.com/Store/${trimmed}`
}

async function scrapeStorePage(storeUrl: string) {
  const res = await fetch(storeUrl, { headers: HEADERS })
  if (!res.ok) throw new Error(`Could not load store page (${res.status}). Check the URL and try again.`)
  const html = await res.text()

  // Store name
  const nameMatch = html.match(/"storeName"\s*:\s*"([^"]+)"/) ||
                    html.match(/<h1[^>]*>([^<]{3,80})<\/h1>/)
  const storeName = nameMatch?.[1]?.trim() || ''

  // Store description / bio
  const bioMatch = html.match(/"storeDescription"\s*:\s*"([^"]*)"/) ||
                   html.match(/"bio"\s*:\s*"([^"]*)"/)
  const bio = bioMatch?.[1]?.replace(/\\n/g, ' ').trim() || ''

  // Has banner image
  const hasBanner = html.includes('store-banner') || html.includes('StoreBanner') ||
                    html.includes('banner-image') || /"bannerImage"\s*:\s*"(https[^"]+)"/.test(html)

  // Has profile / avatar picture
  const hasAvatar = html.includes('seller-avatar') || html.includes('SellerAvatar') ||
                    /"avatarUrl"\s*:\s*"(https[^"]+)"/.test(html) ||
                    /"profilePicture"\s*:\s*"(https[^"]+)"/.test(html)

  // Follower count
  const followerMatch = html.match(/(\d[\d,]*)\s*(?:Follower|follower)/)
  const followers = followerMatch ? parseInt(followerMatch[1].replace(/,/g, ''), 10) : 0

  // Product count
  const productCountMatch = html.match(/"totalCount"\s*:\s*(\d+)/) ||
                            html.match(/(\d[\d,]*)\s*(?:Product|product|Resource|resource)s?/)
  const productCount = productCountMatch ? parseInt(productCountMatch[1].replace(/,/g, ''), 10) : 0

  // Extract product titles, prices, ratings from JSON in page
  const products: { title: string; url: string; price: number; rating: number; ratingCount: number }[] = []

  const arrayPatterns = [
    /"products"\s*:\s*(\[[\s\S]{20,20000}?\])\s*[,}]/,
    /"items"\s*:\s*(\[[\s\S]{20,20000}?\])\s*[,}]/,
    /"listings"\s*:\s*(\[[\s\S]{20,20000}?\])\s*[,}]/,
  ]

  for (const pattern of arrayPatterns) {
    if (products.length > 0) break
    const match = html.match(pattern)
    if (!match) continue
    try {
      const items = JSON.parse(match[1])
      if (!Array.isArray(items)) continue
      for (const item of items.slice(0, 20)) {
        const title = item.name || item.title || item.productTitle || ''
        const slug = item.slug || item.canonicalUrl || item.url || ''
        const rawPrice = item.price || item.currentPrice || item.priceInCents
        const price = rawPrice
          ? (typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice > 100 ? rawPrice / 100 : rawPrice)
          : 0
        const rating = parseFloat(item.rating?.average ?? item.averageRating ?? item.starRating ?? 0)
        const ratingCount = parseInt(item.rating?.count ?? item.ratingCount ?? item.reviewCount ?? 0)
        if (title) {
          products.push({
            title,
            url: slug.startsWith('http') ? slug : slug ? `https://www.teacherspayteachers.com/Product/${slug}` : storeUrl,
            price: parseFloat((price || 0).toFixed(2)),
            rating,
            ratingCount,
          })
        }
      }
    } catch {}
  }

  return { storeName, bio, hasBanner, hasAvatar, followers, productCount, products, storeUrl }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const plan = user.plan || 'free'
  if (plan === 'free') {
    return NextResponse.json({ error: 'Shop Audit is available on Starter and Pro plans. Upgrade to access.' }, { status: 403 })
  }

  const { storeUrl: rawUrl } = await req.json()
  if (!rawUrl?.trim()) return NextResponse.json({ error: 'Store URL is required' }, { status: 400 })

  let storeUrl: string
  try {
    storeUrl = normalizeStoreUrl(rawUrl)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  // Scrape the store
  let storeData: Awaited<ReturnType<typeof scrapeStorePage>>
  try {
    storeData = await scrapeStorePage(storeUrl)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load store page.' }, { status: 500 })
  }

  // Analyze with Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const productSummary = storeData.products.slice(0, 15).map((p, i) =>
    `${i + 1}. "${p.title}" — $${p.price || 'unknown'}, ${p.rating ? `${p.rating}★ (${p.ratingCount} reviews)` : 'no ratings yet'}`
  ).join('\n')

  const prompt = `You are a TpT (Teachers Pay Teachers) store optimization expert. Analyze this TpT store and provide a detailed audit.

STORE DATA:
- Store Name: ${storeData.storeName || 'Unknown'}
- Store URL: ${storeUrl}
- Bio/Description: ${storeData.bio ? `"${storeData.bio}"` : 'MISSING — no bio found'}
- Banner Image: ${storeData.hasBanner ? 'Present' : 'MISSING'}
- Profile Picture: ${storeData.hasAvatar ? 'Present' : 'MISSING'}
- Followers: ${storeData.followers || 'Unknown'}
- Product Count: ${storeData.productCount || storeData.products.length + '+'}
- Sample Products (top 15):
${productSummary || 'Could not extract product data'}

Provide a JSON response with this exact structure:
{
  "overallScore": <number 0-100>,
  "overallGrade": <"A" | "B" | "C" | "D" | "F">,
  "summary": "<2-3 sentence overall assessment>",
  "checks": [
    {
      "category": "<category name>",
      "status": <"pass" | "warning" | "fail">,
      "title": "<short check title>",
      "detail": "<specific actionable feedback — be direct and specific>",
      "priority": <"high" | "medium" | "low">
    }
  ]
}

Include checks for ALL of these categories (in this order):
1. Profile Picture — present and professional?
2. Banner Image — present and visually branded?
3. Store Name — keyword-rich, memorable, professional?
4. Store Bio/Description — present, compelling, mentions what they sell and who it's for?
5. Product Titles — are they SEO-friendly, specific, include grade/subject/format?
6. Pricing Strategy — price range, any free products as lead magnets, pricing consistency?
7. Ratings & Reviews — any low-rated products, overall rating health?
8. Product Variety — range of topics, grade levels, resource types?
9. Seller Branding — does the store feel cohesive and professional overall?

Be direct and specific in the detail field — reference actual data from the store where possible. Return ONLY valid JSON.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')

  let audit: any
  try {
    audit = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Failed to analyze store. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({
    audit,
    storeName: storeData.storeName,
    storeUrl,
    followers: storeData.followers,
    productCount: storeData.productCount,
    products: storeData.products.slice(0, 15),
  })
}
