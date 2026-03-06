import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
}

async function scrapeMarketPrices(keyword: string): Promise<number[]> {
  try {
    const url = `https://www.teacherspayteachers.com/browse?search=${encodeURIComponent(keyword)}&order=Relevance`
    const res = await fetch(url, { headers: HEADERS })
    const html = await res.text()

    // Extract prices from TpT JSON-LD / embedded JSON
    const prices: number[] = []

    // Match price patterns in embedded JSON: "price":"3.00" or "price":3.00
    const priceMatches = html.matchAll(/"price"\s*:\s*"?([\d.]+)"?/g)
    for (const match of priceMatches) {
      const p = parseFloat(match[1])
      if (p >= 0.5 && p <= 25) prices.push(p)
    }

    return prices.slice(0, 20)
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyword, productType, pageCount } = await req.json()
  if (!keyword?.trim()) return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })

  // Scrape real prices from TpT
  const searchTerm = productType ? `${keyword} ${productType}` : keyword
  const prices = await scrapeMarketPrices(searchTerm)

  let marketAvg: number | null = null
  let marketMin: number | null = null
  let marketMax: number | null = null
  let sampleSize = 0

  if (prices.length > 0) {
    sampleSize = prices.length
    marketAvg = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2))
    marketMin = Math.min(...prices)
    marketMax = Math.max(...prices)
  }

  // Rule-based suggestion as baseline
  const pages = parseInt(pageCount) || 0
  let suggested = 3.00

  if (productType) {
    const pt = productType.toLowerCase()
    if (pt.includes('bundle')) suggested = pages > 50 ? 12.00 : 8.00
    else if (pt.includes('unit')) suggested = pages > 30 ? 10.00 : 7.00
    else if (pt.includes('worksheet') || pt.includes('activity')) suggested = pages > 20 ? 4.00 : 3.00
    else if (pt.includes('task card')) suggested = pages > 30 ? 4.00 : 3.00
    else if (pt.includes('lesson plan')) suggested = 5.00
    else if (pt.includes('poster') || pt.includes('anchor chart')) suggested = 3.00
    else if (pt.includes('assessment') || pt.includes('test') || pt.includes('quiz')) suggested = 3.50
    else if (pt.includes('game')) suggested = 4.00
    else if (pt.includes('digital')) suggested = pages > 20 ? 5.00 : 3.50
  } else if (pages > 0) {
    if (pages <= 5) suggested = 2.00
    else if (pages <= 15) suggested = 3.00
    else if (pages <= 30) suggested = 4.00
    else if (pages <= 60) suggested = 6.00
    else suggested = 10.00
  }

  // Blend with market data if available
  let recommended = suggested
  if (marketAvg) {
    recommended = parseFloat(((suggested + marketAvg) / 2).toFixed(2))
  }

  // Round to nearest $0.50
  recommended = Math.round(recommended * 2) / 2

  return NextResponse.json({
    recommended,
    suggested,
    marketAvg,
    marketMin,
    marketMax,
    sampleSize,
    keyword: searchTerm,
  })
}
