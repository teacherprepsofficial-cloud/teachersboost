import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Feedback } from '@/models/Feedback'
import { Testimonial } from '@/models/Testimonial'

const ADMIN_EMAILS = ['teachersboost@gmail.com', 'elliottzelinskas@gmail.com']

// GET — all inbound (feedback + testimonials)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const [feedbackItems, testimonials] = await Promise.all([
    Feedback.find().sort({ createdAt: -1 }).limit(200),
    Testimonial.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).limit(200),
  ])

  const feedback = feedbackItems.map(f => ({ ...f.toObject(), _type: 'feedback' }))
  const tests = testimonials.map(t => ({ ...t.toObject(), _type: 'testimonial' }))

  // Merge and sort by date
  const all = [...feedback, ...tests].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return NextResponse.json({ items: all })
}

// PATCH — update testimonial status
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status } = await req.json()
  if (!id || !['published', 'deleted', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  await connectDB()
  await Testimonial.findByIdAndUpdate(id, { status })
  return NextResponse.json({ success: true })
}
