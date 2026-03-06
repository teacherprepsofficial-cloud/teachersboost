import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, gradeLevel, standardsSet } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  if (!standardsSet) return NextResponse.json({ error: 'Standards set is required' }, { status: 400 })

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const standardsDescriptions: Record<string, string> = {
    CCSS: 'Common Core State Standards (CCSS) for ELA and Math',
    TEKS: 'Texas Essential Knowledge and Skills (TEKS)',
    NGSS: 'Next Generation Science Standards (NGSS)',
  }

  const prompt = `You are an expert curriculum alignment specialist. Identify the most relevant ${standardsDescriptions[standardsSet]} standards for a TpT product.

Topic: "${topic}"
${gradeLevel ? `Grade Level: ${gradeLevel}` : 'Grade Level: Not specified'}
Standards Set: ${standardsSet}

Return the 3-6 most relevant standards as a JSON array. Each item should have:
- "code": the standard code (e.g. "CCSS.ELA-LITERACY.RI.3.1", "TEKS 111.5(b)(4)(A)", "3-LS1-1")
- "description": a brief plain-English description of what the standard covers (1 sentence)
- "relevance": "high", "medium", or "low"

Return ONLY a valid JSON array, nothing else.`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  let standards: any[]
  try {
    standards = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to find standards. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ standards, topic, gradeLevel, standardsSet })
}
