import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { scrapeKeywordResults, scrapeKeywordSuggestions } from '@/lib/scraper'
import { KeywordSearch } from '@/models/KeywordSearch'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyword } = await req.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Invalid keyword' }, { status: 400 })
    }

    await connectDB()

    // Look up user by email
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check freemium limits (weekly: 3 searches per week)
    if (user.plan !== 'pro' && user.plan !== 'admin') {
      const now = new Date()
      const lastDate = new Date(user.dailySearchDate)
      const msPerWeek = 7 * 24 * 60 * 60 * 1000
      const newWeek = now.getTime() - lastDate.getTime() > msPerWeek

      if (newWeek) {
        user.dailySearchCount = 0
        user.dailySearchDate = now
        await user.save()
      }

      if (user.dailySearchCount >= 3) {
        return NextResponse.json(
          { error: 'Weekly search limit reached', remaining: 0, limit: 3 },
          { status: 429 }
        )
      }
    }

    // Check cache first
    let keywordData = await KeywordSearch.findOne({ keyword: keyword.toLowerCase() })

    if (
      keywordData &&
      new Date().getTime() - new Date(keywordData.lastScrapedAt).getTime() < 86400000
    ) {
      return NextResponse.json(keywordData)
    }

    // Scrape main keyword
    const results = await scrapeKeywordResults(keyword)

    // Get suggestions and scrape each
    const suggestions = await scrapeKeywordSuggestions(keyword)
    const suggestionsWithScores = await Promise.all(
      suggestions.slice(0, 5).map(async (sug) => {
        const r = await scrapeKeywordResults(sug)
        return {
          keyword: sug,
          resultCount: r.resultCount,
          competitionScore: r.competitionScore,
          isRocket: r.isRocket,
        }
      })
    )

    // Save to cache
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

    // Increment usage
    if (user.plan !== 'pro' && user.plan !== 'admin') {
      user.dailySearchCount += 1
      await user.save()
    }

    return NextResponse.json(keywordData)
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape keyword data' }, { status: 500 })
  }
}
