import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { scrapeKeywordResults, scrapeKeywordSuggestions, scrapeKeywordLongTail } from '@/lib/scraper'
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

    // Trending = TpT Algolia suggestions with competition scores
    const trendingSuggestions = await scrapeKeywordSuggestions(keyword)
    const trendingKeywords = await Promise.all(
      trendingSuggestions.map(async (kw) => {
        const r = await scrapeKeywordResults(kw)
        return { keyword: kw, resultCount: r.resultCount, competitionScore: r.competitionScore, isRocket: r.isRocket }
      })
    )

    // Long-tail = grade/format variations with competition scores
    const longTail = await scrapeKeywordLongTail(keyword)
    const suggestionsWithScores = await Promise.all(
      longTail.slice(0, 8).map(async (sug) => {
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
    const saveData = {
      keyword: keyword.toLowerCase(),
      resultCount: results.resultCount,
      competitionScore: results.competitionScore,
      isRocket: results.isRocket,
      suggestions: suggestionsWithScores,
      topProducts: [],
      lastScrapedAt: new Date(),
    }

    if (keywordData) {
      Object.assign(keywordData, saveData)
      await keywordData.save()
    } else {
      keywordData = new KeywordSearch(saveData)
      await keywordData.save()
    }

    // Increment usage
    if (user.plan !== 'pro' && user.plan !== 'admin') {
      user.dailySearchCount += 1
      await user.save()
    }

    return NextResponse.json({ ...keywordData.toObject(), trending: trendingKeywords })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape keyword data' }, { status: 500 })
  }
}
