import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Feedback } from '@/models/Feedback'

export async function GET(req: NextRequest) {
  try {
    // TODO: Add auth check for admin users only
    await connectDB()

    const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(100)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Admin feedback error:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}
