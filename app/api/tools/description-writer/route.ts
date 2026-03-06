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
  if (!limit) return NextResponse.json({ error: 'Upgrade to a paid plan to use the Description Writer.' }, { status: 403 })

  const { gradeLevel, subject, topic, skill, resourceType, extraNotes } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const currentMonth = new Date().toISOString().slice(0, 7)
  if (user.aiUsageMonth !== currentMonth) {
    user.aiTitleCount = 0
    user.aiDescCount = 0
    user.aiUsageMonth = currentMonth
  }

  if (user.aiDescCount >= limit) {
    return NextResponse.json({ error: `You've reached your ${limit} description generations for this month. Upgrade for more.` }, { status: 429 })
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Determine which standard sets to pull based on subject
  const subjectLower = (subject || '').toLowerCase()
  const isScience = subjectLower.includes('science') || subjectLower.includes('biology') || subjectLower.includes('chemistry') || subjectLower.includes('physics') || subjectLower.includes('earth')
  const isMath = subjectLower.includes('math') || subjectLower.includes('algebra') || subjectLower.includes('geometry') || subjectLower.includes('calculus') || subjectLower.includes('fraction') || subjectLower.includes('number')
  const isELA = subjectLower.includes('english') || subjectLower.includes('reading') || subjectLower.includes('writing') || subjectLower.includes('literacy') || subjectLower.includes('ela') || subjectLower.includes('grammar') || subjectLower.includes('vocabulary')
  const standardSets = ['CCSS', 'TEKS', ...(isScience ? ['NGSS'] : [])]

  const prompt = `You are an expert TpT (Teachers Pay Teachers) product listing specialist and curriculum alignment expert.

A seller is creating a product with these details:
${gradeLevel ? `- Grade Level: ${gradeLevel}` : ''}
${subject ? `- Subject: ${subject}` : ''}
- Topic: ${topic}
${skill ? `- Skill: ${skill}` : ''}
${resourceType ? `- Resource Type: ${resourceType}` : ''}
${extraNotes ? `- Additional Notes: ${extraNotes}` : ''}

Your task is to return a JSON object with two keys: "description" and "standards".

**description**: A compelling TpT product description (under 300 words) with these sections:
1. Opening hook (1-2 sentences speaking directly to the teacher's problem/need)
2. "What's Included:" (bullet list of 4-6 specific items based on the resource type)
3. "Why Teachers Love This:" (bullet list of 3-4 benefits)
4. "Perfect For:" (bullet list of 3-4 use cases)
5. "Standards Aligned:" (brief mention that standards are listed below)
6. Closing CTA sentence
Use natural, enthusiastic teacher-to-teacher language. Plain text only, no markdown.

**standards**: An array of the most relevant education standards from these sets: ${standardSets.join(', ')}. Each standard object must have:
- "set": the standards set name (e.g. "CCSS", "TEKS", "NGSS")
- "code": the exact standard code
- "description": one plain-English sentence describing what the standard covers
- "relevance": "high", "medium", or "low"

Include 3-5 standards total across all relevant sets. Only include standards that are genuinely applicable to this specific topic and grade level.

Return ONLY a valid JSON object like:
{"description": "...", "standards": [{"set":"CCSS","code":"...","description":"...","relevance":"high"}]}`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')

  let parsed: { description: string; standards: any[] }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Failed to generate. Please try again.' }, { status: 500 })
  }

  user.aiDescCount += 1
  await user.save()

  const remaining = limit === Infinity ? null : limit - user.aiDescCount
  return NextResponse.json({
    description: parsed.description,
    standards: parsed.standards || [],
    used: user.aiDescCount,
    limit,
    remaining,
  })
}
