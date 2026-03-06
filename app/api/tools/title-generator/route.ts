import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { GoogleGenerativeAI } from '@google/generative-ai'

const LIMITS: Record<string, number> = { starter: 20, pro: 75, admin: Infinity }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = session.user.plan || 'free'
  const limit = LIMITS[plan]
  if (!limit) return NextResponse.json({ error: 'Upgrade to a paid plan to use the Title Generator.' }, { status: 403 })

  const { keyword, gradeLevel, subjectArea, benefit, resourceType } = await req.json()
  if (!keyword?.trim()) return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Reset monthly counter if new month
  const currentMonth = new Date().toISOString().slice(0, 7)
  if (user.aiUsageMonth !== currentMonth) {
    user.aiTitleCount = 0
    user.aiDescCount = 0
    user.aiUsageMonth = currentMonth
  }

  if (user.aiTitleCount >= limit) {
    return NextResponse.json({ error: `You've reached your ${limit} title generations for this month. Upgrade for more.` }, { status: 429 })
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are an expert TpT (Teachers Pay Teachers) product listing specialist. Generate 5 SEO-optimized product titles for a TpT product.

Keyword / Topic: "${keyword}"
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}
${subjectArea ? `Subject Area: ${subjectArea}` : ''}
${benefit ? `Benefit / Feature: ${benefit}` : ''}
${resourceType ? `Resource Type: ${resourceType}` : ''}

Rules for great TpT titles:
- Start with the main keyword or a close variation
- Naturally weave in the grade level, subject, benefit, and resource type when provided
- Keep under 80 characters
- Be specific and descriptive
- Use natural language teachers would search for on TpT

Return ONLY a JSON array of 5 title strings, nothing else. Example format:
["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  let titles: string[]
  try {
    titles = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to generate titles. Please try again.' }, { status: 500 })
  }

  user.aiTitleCount += 1
  await user.save()

  const remaining = limit === Infinity ? null : limit - user.aiTitleCount
  return NextResponse.json({ titles, used: user.aiTitleCount, limit, remaining })
}
