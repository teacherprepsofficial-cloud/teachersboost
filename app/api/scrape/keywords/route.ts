import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { scraper } from '@/lib/scraper'
import { KeywordSearch } from '@/models/KeywordSearch'
import { checkSearchLimit, incrementSearchCount } from '@/lib/freemium'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyword } = await req.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Invalid keyword' }, { status: 400 })
    }

    // Check freemium limits
    const limit = await checkSearchLimit(session.user.id)
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Daily search limit reached',
          remaining: limit.remaining,
          limit: limit.limit,
        },
        { status: 429 }
      )
    }

    await connectDB()

    // Check cache first
    let keywordData = await KeywordSearch.findOne({
      keyword: keyword.toLowerCase(),
    })

    if (
      keywordData &&
      new Date().getTime() - new Date(keywordData.lastScrapedAt).getTime() < 86400000 // 24 hours
    ) {
      // Return cached data
      return NextResponse.json(keywordData)
    }

    // Scrape new data
    const results = await scraper.scrapeKeywordResults(keyword)

    // Get suggestions
    const suggestions = await scraper.scrapeKeywordSuggestions(keyword)

    // For each suggestion, get its result count
    const suggestionsWithScores = await Promise.all(
      suggestions.slice(0, 5).map(async (sug) => {
        const suggestionResults = await scraper.scrapeKeywordResults(sug)
        return {
          keyword: sug,
          resultCount: suggestionResults.resultCount,
          competitionScore: suggestionResults.competitionScore,
          isRocket: suggestionResults.isRocket,
        }
      })
    )

    // Save or update in cache
    if (keywordData) {
      keywordData.resultCount = results.resultCount
      keywordData.competitionScore = results.competitionScore
      keywordData.isRocket = results.isRocket
      keywordData.suggestions = suggestionsWithScores
      keywordData.lastScrapedAt = new Date()
      await keywordData.save()
    } else {
      keywordData = new KeywordSearch({
        keyword: keyword.toLowerCase(),
        resultCount: results.resultCount,
        competitionScore: results.competitionScore,
        isRocket: results.isRocket,
        suggestions: suggestionsWithScores,
        topProducts: [],
        lastScrapedAt: new Date(),
      })
      await keywordData.save()
    }

    // Increment search count for freemium
    await incrementSearchCount(session.user.id)

    return NextResponse.json(keywordData)
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape keyword data' },
      { status: 500 }
    )
  }
}
