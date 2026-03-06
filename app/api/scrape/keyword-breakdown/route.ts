import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scrapeKeywordResults, scrapeTopProducts, scrapeKeywordSuggestions, scrapeKeywordLongTail, scrapeFirstProduct } from '@/lib/scraper'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Keyword breakdown is accessible without login (read-only scrape)

    const { keyword } = await req.json()
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword required' }, { status: 400 })
    }

    // Use Algolia (real TpT autocomplete) for matching keywords.
    // Fall back to algorithmic long-tail only if Algolia returns fewer than 3.
    const algoliaKeywords = await scrapeKeywordSuggestions(keyword)
    const longTailKeywords = algoliaKeywords.length >= 3
      ? algoliaKeywords
      : [...algoliaKeywords, ...(await scrapeKeywordLongTail(keyword))]

    const SORT_ORDERS = [
      { key: 'topRanking',  order: 'Relevance',   label: '#1 Top Ranking Product',  icon: '🏆' },
      { key: 'topRated',    order: 'Rating',       label: '#1 Top Rated Product',    icon: '⭐' },
      { key: 'lowestPrice', order: 'Price-Asc',    label: 'Lowest Priced Product',   icon: '🏷️' },
      { key: 'mostRecent',  order: 'Most-Recent',  label: 'Most Recently Uploaded',  icon: '🆕' },
    ]

    const [results, topProducts, sortProducts, longTailResults] = await Promise.all([
      scrapeKeywordResults(keyword),
      scrapeTopProducts(keyword),
      Promise.all(SORT_ORDERS.map(s => scrapeFirstProduct(keyword, s.order))),
      Promise.all(longTailKeywords.map(kw => scrapeKeywordResults(kw).then(r => ({ keyword: kw, ...r })))),
    ])

    const competitionLinks = SORT_ORDERS.map((s, i) => ({
      label: s.label,
      icon: s.icon,
      title: sortProducts[i]?.title || null,
      url: sortProducts[i]?.url || `https://www.teacherspayteachers.com/browse?search=${encodeURIComponent(keyword)}&order=${s.order}`,
    }))

    return NextResponse.json({
      keyword,
      resultCount: results.resultCount,
      competitionScore: results.competitionScore,
      isRocket: results.isRocket,
      topProducts,
      competitionLinks,
      matchingKeywords: longTailResults,
    })
  } catch (error) {
    console.error('Keyword breakdown error:', error)
    return NextResponse.json({ error: 'Failed to load keyword breakdown' }, { status: 500 })
  }
}
