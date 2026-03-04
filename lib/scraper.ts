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
  // TpT suggestions come from their internal API — generate related terms instead
  const words = keyword.toLowerCase().split(' ')
  const variations = [
    keyword,
    `${keyword} activities`,
    `${keyword} worksheets`,
    `${keyword} lesson plan`,
    `${keyword} printable`,
    `${keyword} kindergarten`,
    `${keyword} 1st grade`,
    `${keyword} 2nd grade`,
    `${keyword} craft`,
    `${keyword} anchor chart`,
  ]
  return [...new Set(variations)].slice(0, 8)
}

export interface TopProduct {
  title: string
  url: string
  price: number
  rating: number
  ratingCount: number
  sellerName: string
}

export async function scrapeTopProducts(keyword: string): Promise<TopProduct[]> {
  try {
    const url = `${TPT_BASE}/browse?search=${encodeURIComponent(keyword)}&order=Relevance`
    const html = await fetchPage(url)

    const products: TopProduct[] = []

    // TpT embeds product data as JSON in the page
    const dataMatch = html.match(/"products"\s*:\s*(\[[\s\S]*?\])\s*,\s*"(?:totalCount|pagination)"/m)
    if (dataMatch) {
      try {
        const items = JSON.parse(dataMatch[1])
        for (const item of items.slice(0, 6)) {
          const title = item.name || item.title || ''
          const slug = item.slug || item.url || ''
          const price = parseFloat(item.price) || 0
          const rating = parseFloat(item.rating?.average || item.averageRating || 0)
          const ratingCount = parseInt(item.rating?.count || item.ratingCount || 0)
          const sellerName = item.seller?.name || item.storeName || ''

          if (title) {
            products.push({
              title,
              url: slug.startsWith('http') ? slug : `${TPT_BASE}/Product/${slug}`,
              price,
              rating,
              ratingCount,
              sellerName,
            })
          }
        }
      } catch {}
    }

    // Fallback: extract from og/meta tags or structured data
    if (products.length === 0) {
      const scriptMatches = html.matchAll(/"name":"([^"]{10,}?)","slug":"([^"]+?)","price":"?(\d+\.?\d*)"?/g)
      for (const m of scriptMatches) {
        if (products.length >= 6) break
        products.push({
          title: m[1],
          url: `${TPT_BASE}/Product/${m[2]}`,
          price: parseFloat(m[3]) || 0,
          rating: 0,
          ratingCount: 0,
          sellerName: '',
        })
      }
    }

    return products.slice(0, 6)
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
