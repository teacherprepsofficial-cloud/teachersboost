import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { scrapeKeywordSuggestions, scrapeKeywordResults } from '@/lib/scraper'
import { sendWeeklyOpportunitiesEmail } from '@/lib/email'

// Seed terms to pull Algolia suggestions from — broad enough to get diverse results
const SEED_TERMS = ['reading', 'math', 'writing', 'science', 'worksheets', 'activities', 'vocabulary', 'centers']

export async function GET(req: Request) {
  // Verify request is from Vercel cron (or manual trigger with secret)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Collect keyword candidates from Algolia suggestions
    const candidateSet = new Set<string>()
    for (const seed of SEED_TERMS) {
      const suggestions = await scrapeKeywordSuggestions(seed)
      suggestions.forEach(s => candidateSet.add(s.toLowerCase()))
      if (candidateSet.size >= 60) break
    }

    // 2. Score each candidate and find rockets / low-competition
    const scored: { keyword: string; competitionScore: number; isRocket: boolean }[] = []
    for (const kw of Array.from(candidateSet)) {
      if (scored.length >= 80) break
      const result = await scrapeKeywordResults(kw)
      if (result.resultCount > 0) {
        scored.push({ keyword: kw, competitionScore: result.competitionScore, isRocket: result.isRocket })
      }
    }

    // 3. Sort by competition score ascending — rockets first
    scored.sort((a, b) => a.competitionScore - b.competitionScore)
    const top10 = scored.slice(0, 10)

    if (top10.length === 0) {
      return NextResponse.json({ error: 'No keywords found' }, { status: 500 })
    }

    // 4. Get recipients — ?test=email sends only to that address
    await connectDB()
    const url = new URL(req.url)
    const testEmail = url.searchParams.get('test')
    const users: { email: string; name: string }[] = testEmail
      ? [{ email: testEmail, name: 'Teacher' }]
      : await User.find({ emailOptIn: { $ne: false } }).select('name email').lean()

    // 5. Send email to each user
    let sent = 0
    for (const user of users) {
      try {
        await sendWeeklyOpportunitiesEmail(user.email, user.name, top10)
        sent++
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err)
      }
    }

    return NextResponse.json({ success: true, sent, keywords: top10.map(k => k.keyword) })
  } catch (error) {
    console.error('Weekly email cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
