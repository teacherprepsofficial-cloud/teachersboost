import * as cheerio from 'cheerio'

const TPT_BASE = 'https://www.teacherspayteachers.com'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

export async function scrapeKeywordResults(keyword: string): Promise<{
  resultCount: number
  competitionScore: number
  isRocket: boolean
}> {
  try {
    const url = `${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}`
    const html = await fetchPage(url)

    // TpT embeds result count as JSON in the HTML
    const match = html.match(/"totalCount":(\d+)/)
    const resultCount = match ? parseInt(match[1], 10) : 0

    const competitionScore = parseFloat((resultCount / 1000).toFixed(2))
    const isRocket = resultCount < 1000 && resultCount > 0

    return { resultCount, competitionScore, isRocket }
  } catch (error) {
    console.error(`Error scraping results for "${keyword}":`, error)
    return { resultCount: 0, competitionScore: 0, isRocket: false }
  }
}

export async function scrapeKeywordSuggestions(keyword: string): Promise<string[]> {
  try {
    const res = await fetch('https://sbekgjsj8m-3.algolianet.com/1/indexes/*/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-api-key': 'ce17b545c6ba0432cf638e0c29ee64ef',
        'x-algolia-application-id': 'SBEKGJSJ8M',
      },
      body: JSON.stringify({
        requests: [{
          indexName: 'Resource Suggestions',
          params: `hitsPerPage=5&query=${encodeURIComponent(keyword)}`,
        }],
      }),
    })
    if (!res.ok) throw new Error('Algolia error')
    const data = await res.json()
    const hits = data?.results?.[0]?.hits || []
    return hits.map((h: any) => h.query as string).filter(Boolean)
  } catch {
    return []
  }
}

type TptProductType =
  | 'bulletin-board' | 'worksheet' | 'activities' | 'lesson-plan'
  | 'task-cards' | 'anchor-chart' | 'centers' | 'game' | 'craft'
  | 'coloring' | 'clip-art' | 'poster' | 'flash-cards' | 'generic'

function detectProductType(kw: string): TptProductType {
  if (/bulletin\s*board/.test(kw))   return 'bulletin-board'
  if (/\bworksheets?\b/.test(kw))    return 'worksheet'
  if (/\bactivit(y|ies)\b/.test(kw)) return 'activities'
  if (/\blesson\s*plan/.test(kw))    return 'lesson-plan'
  if (/\btask\s*cards?\b/.test(kw))  return 'task-cards'
  if (/\banchor\s*chart/.test(kw))   return 'anchor-chart'
  if (/\bcenters?\b/.test(kw))       return 'centers'
  if (/\bgames?\b/.test(kw))         return 'game'
  if (/\bcrafts?\b/.test(kw))        return 'craft'
  if (/\bcoloring\b/.test(kw))       return 'coloring'
  if (/\bclip\s*art\b/.test(kw))     return 'clip-art'
  if (/\bposters?\b/.test(kw))       return 'poster'
  if (/\bflash\s*cards?\b/.test(kw)) return 'flash-cards'
  return 'generic'
}

const GRADE_LEVELS = [
  'kindergarten', '1st grade', '2nd grade', '3rd grade',
  '4th grade', '5th grade', '6th grade', 'middle school', 'high school',
]

const HAS_GRADE = /\b(preschool|kindergarten|kinder|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|elementary|middle school|high school)\b/

const CONTEXTUAL_SUFFIXES: Record<TptProductType, string[]> = {
  'bulletin-board': ['fall', 'spring', 'winter', 'back to school', 'black and white', 'free', 'classroom decor'],
  'worksheet':      ['free', 'pdf', 'answer key', 'digital', 'no prep'],
  'activities':     ['free', 'printable', 'digital', 'hands on', 'interactive'],
  'lesson-plan':    ['free', 'week long', 'unit plan', 'sub plan'],
  'task-cards':     ['digital', 'boom cards', 'free', 'printable', 'bundle'],
  'anchor-chart':   ['printable', 'free', 'poster', 'bundle'],
  'centers':        ['free', 'printable', 'digital', 'math', 'literacy'],
  'game':           ['free', 'digital', 'printable', 'board game', 'review game'],
  'craft':          ['template', 'free', 'printable', 'fall', 'spring', 'winter', 'no prep'],
  'coloring':       ['free', 'printable', 'seasonal', 'easy', 'bundle'],
  'clip-art':       ['free', 'commercial use', 'png', 'bundle', 'black and white'],
  'poster':         ['free', 'bundle', 'printable', 'classroom', 'anchor chart'],
  'flash-cards':    ['free', 'printable', 'digital', 'boom cards'],
  'generic':        ['activities', 'worksheets', 'printable', 'free', 'lesson plan', 'bundle'],
}

export async function scrapeKeywordLongTail(keyword: string): Promise<string[]> {
  const kw = keyword.toLowerCase().trim()
  const type = detectProductType(kw)
  const hasGrade = HAS_GRADE.test(kw)

  // Grade expansions — most valuable for sellers picking their target audience
  const gradeExpansions = hasGrade ? [] : GRADE_LEVELS.map(g => `${kw} ${g}`)

  // Contextual suffixes — only ones that make sense for this product type
  const suffixVariants = CONTEXTUAL_SUFFIXES[type].map(s => `${kw} ${s}`)

  // Grade expansions first (more actionable), then contextual, deduped, capped at 10
  return [...new Set([...gradeExpansions, ...suffixVariants])].slice(0, 10)
}

export interface TopProduct {
  title: string
  url: string
  price: number
  rating: number
  ratingCount: number
  sellerName: string
}

export async function scrapeFirstProduct(keyword: string, order: string): Promise<{ title: string; url: string } | null> {
  try {
    const html = await fetchPage(`${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}&order=${order}`)

    // Strategy 1: JSON arrays
    const arrayPatterns = [
      /"products"\s*:\s*(\[[\s\S]{20,10000}?\])\s*[,}]/,
      /"items"\s*:\s*(\[[\s\S]{20,10000}?\])\s*[,}]/,
      /"listings"\s*:\s*(\[[\s\S]{20,10000}?\])\s*[,}]/,
    ]
    for (const pattern of arrayPatterns) {
      const match = html.match(pattern)
      if (!match) continue
      try {
        const items = JSON.parse(match[1])
        if (!Array.isArray(items) || items.length === 0) continue
        const item = items[0]
        const title = item.name || item.title || item.productTitle || ''
        const slug = item.slug || item.canonicalUrl || item.url || ''
        if (title && slug) {
          return {
            title,
            url: slug.startsWith('http') ? slug : `${TPT_BASE}/Product/${slug}`,
          }
        }
      } catch {}
    }

    // Strategy 2: find first product link from HTML
    const linkMatch = html.match(/href="(\/Product\/[^"]+)"[^>]*>/)
    if (linkMatch) {
      const url = `${TPT_BASE}${linkMatch[1]}`
      const titleMatch = html.match(new RegExp(`href="${linkMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>\\s*<[^>]+>\\s*([^<]{10,120})`))
      return { title: titleMatch?.[1]?.trim() || 'View Product', url }
    }

    return null
  } catch {
    return null
  }
}

export async function scrapeTopProducts(keyword: string): Promise<TopProduct[]> {
  try {
    const url = `${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}&order=Relevance`
    const html = await fetchPage(url)

    const products: TopProduct[] = []

    // Strategy 1: find any JSON array labeled "products" or "items"
    const arrayPatterns = [
      /"products"\s*:\s*(\[[\s\S]{20,10000}?\])\s*[,}]/,
      /"items"\s*:\s*(\[[\s\S]{20,10000}?\])\s*[,}]/,
      /"listings"\s*:\s*(\[[\s\S]{20,10000}?\])\s*[,}]/,
    ]

    for (const pattern of arrayPatterns) {
      if (products.length > 0) break
      const match = html.match(pattern)
      if (!match) continue
      try {
        const items = JSON.parse(match[1])
        if (!Array.isArray(items)) continue
        for (const item of items.slice(0, 24)) {
          const title = item.name || item.title || item.productTitle || ''
          const slug = item.slug || item.canonicalUrl || item.url || ''
          const rawPrice = item.price || item.currentPrice || item.priceInCents
          const price = rawPrice
            ? (typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice > 100 ? rawPrice / 100 : rawPrice)
            : 0
          const rating = parseFloat(item.rating?.average ?? item.averageRating ?? item.starRating ?? 0)
          const ratingCount = parseInt(item.rating?.count ?? item.ratingCount ?? item.reviewCount ?? 0)
          const sellerName = item.seller?.name ?? item.storeName ?? item.author?.name ?? ''

          if (title && price > 0) {
            products.push({
              title,
              url: slug.startsWith('http') ? slug : `${TPT_BASE}/Product/${slug}`,
              price: parseFloat(price.toFixed(2)),
              rating,
              ratingCount,
              sellerName,
            })
          }
        }
      } catch {}
    }

    // Strategy 2: regex for price patterns scattered in HTML
    if (products.length === 0) {
      const priceMatches = [...html.matchAll(/"(?:price|currentPrice)"\s*:\s*"?(\d+\.?\d*)"?/g)]
      const titleMatches = [...html.matchAll(/"(?:name|title)"\s*:\s*"([^"]{15,120})"/g)]
      const slugMatches  = [...html.matchAll(/"slug"\s*:\s*"([^"]+)"/g)]
      const len = Math.min(priceMatches.length, titleMatches.length, 24)
      for (let i = 0; i < len && products.length < 24; i++) {
        const price = parseFloat(priceMatches[i][1])
        if (price > 0 && price < 500) {
          products.push({
            title: titleMatches[i][1],
            url: slugMatches[i] ? `${TPT_BASE}/Product/${slugMatches[i][1]}` : `${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}`,
            price,
            rating: 0,
            ratingCount: 0,
            sellerName: '',
          })
        }
      }
    }

    // Sanity filter: TpT products are $0–$25. Anything outside is likely metadata noise.
    const filtered = products.filter(p => p.price >= 0.5 && p.price <= 25)
    return filtered.slice(0, 24)
  } catch (error) {
    console.error(`Error scraping top products for "${keyword}":`, error)
    return []
  }
}

export async function scrapeShop(shopUrl: string): Promise<{
  storeName: string
  rating: number
  ratingCount: number
  followers: number
  productCount: number
}> {
  try {
    const html = await fetchPage(shopUrl)
    const $ = cheerio.load(html)

    const bodyText = $('body').text()

    const followerMatch = bodyText.match(/(\d+(?:,\d+)?)\s*followers?/i)
    const followers = followerMatch ? parseInt(followerMatch[1].replace(/,/g, ''), 10) : 0

    const ratingMatch = bodyText.match(/([\d.]+)\s*out of\s*5|rating[:\s]*([\d.]+)/i)
    const rating = ratingMatch ? parseFloat(ratingMatch[1] || ratingMatch[2]) : 0

    const storeName = $('h1').first().text().trim() || 'Unknown Store'

    return { storeName, rating, ratingCount: 0, followers, productCount: 0 }
  } catch (error) {
    console.error(`Error scraping shop "${shopUrl}":`, error)
    return { storeName: '', rating: 0, ratingCount: 0, followers: 0, productCount: 0 }
  }
}
