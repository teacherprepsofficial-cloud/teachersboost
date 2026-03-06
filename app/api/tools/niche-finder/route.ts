import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { scrapeKeywordResults } from '@/lib/scraper'

const LIMITS: Record<string, number> = { free: 5, starter: Infinity, pro: Infinity, admin: Infinity }
const MONTHLY_CAPS: Record<string, number> = { free: 5, starter: Infinity, pro: Infinity, admin: Infinity }
const RESULT_LIMIT: Record<string, number> = { free: 5, starter: 10, pro: 25, admin: 25 }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role } = await req.json()
  if (!role?.trim()) return NextResponse.json({ error: 'Role is required' }, { status: 400 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const plan = (user.plan || 'free') as string
  const monthlyCap = MONTHLY_CAPS[plan] ?? 5

  // Reset monthly counter if new month
  const currentMonth = new Date().toISOString().slice(0, 7)
  if (user.aiUsageMonth !== currentMonth) {
    user.aiTitleCount = 0
    user.aiDescCount = 0
    user.aiNicheCount = 0
    user.aiUsageMonth = currentMonth
  }

  if (user.aiNicheCount >= monthlyCap) {
    const msg = plan === 'free'
      ? `You've used your 3 free Niche Finder searches for this month. Upgrade to get unlimited searches.`
      : `You've reached your limit for this month.`
    return NextResponse.json({ error: msg }, { status: 429 })
  }

  // Generate keyword ideas with Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are a TpT (Teachers Pay Teachers) market research expert.

A teacher has described their role as: "${role}"

Generate exactly 35 specific TpT product keyword ideas that:
1. Are directly relevant to what this teacher teaches or works with every day
2. Have realistic buyer demand on TpT (teachers actually search for these)
3. Are specific enough to be searchable (not too broad like "math" or "reading")
4. Cover a mix of: core curriculum topics, seasonal/holiday themes, classroom management, specific skills, and resource types

Return ONLY a JSON array of 35 keyword strings, nothing else. Each keyword should be 2-5 words. Example:
["3rd grade fractions worksheet", "reading comprehension passages grade 3", ...]`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')

  let keywords: string[]
  try {
    keywords = JSON.parse(raw)
    if (!Array.isArray(keywords)) throw new Error()
    keywords = keywords.slice(0, 35)
  } catch {
    return NextResponse.json({ error: 'Failed to generate keyword ideas. Please try again.' }, { status: 500 })
  }

  // Scrape competition scores in parallel
  const results = await Promise.allSettled(
    keywords.map(async (kw) => {
      const data = await scrapeKeywordResults(kw)
      return { keyword: kw, ...data }
    })
  )

  const scored = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.resultCount > 0)
    .map(r => r.value)
    .sort((a, b) => a.competitionScore - b.competitionScore)

  // Apply result limit based on plan
  const limit = RESULT_LIMIT[plan] ?? 5
  const trimmed = scored.slice(0, limit)

  user.aiNicheCount += 1
  await user.save()

  return NextResponse.json({
    niches: trimmed,
    total: scored.length,
    role,
    plan,
    used: user.aiNicheCount,
    remaining: monthlyCap === Infinity ? null : monthlyCap - user.aiNicheCount,
  })
}
