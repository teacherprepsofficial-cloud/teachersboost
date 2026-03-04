import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scrapeKeywordResults, scrapeTopProducts } from '@/lib/scraper'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyword } = await req.json()
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword required' }, { status: 400 })
    }

    const [results, topProducts] = await Promise.all([
      scrapeKeywordResults(keyword),
      scrapeTopProducts(keyword),
    ])

    // Calculate avg price from top products
    const priced = topProducts.filter(p => p.price > 0)
    const avgPrice = priced.length
      ? parseFloat((priced.reduce((s, p) => s + p.price, 0) / priced.length).toFixed(2))
      : 0

    return NextResponse.json({
      keyword,
      resultCount: results.resultCount,
      competitionScore: results.competitionScore,
      isRocket: results.isRocket,
      avgPrice,
      topProducts,
    })
  } catch (error) {
    console.error('Keyword breakdown error:', error)
    return NextResponse.json({ error: 'Failed to load keyword breakdown' }, { status: 500 })
  }
}
