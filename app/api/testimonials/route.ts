import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Testimonial } from '@/models/Testimonial'

// GET — published testimonials (public)
export async function GET() {
  await connectDB()
  const testimonials = await Testimonial.find({ status: 'published' }).sort({ createdAt: -1 })
  return NextResponse.json({ testimonials })
}

// POST — submit a testimonial
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rating, message } = await req.json()
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating is required (1–5)' }, { status: 400 })
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  if (message.trim().length > 600) return NextResponse.json({ error: 'Message too long (max 600 characters)' }, { status: 400 })

  await connectDB()
  const testimonial = new Testimonial({
    userId: session.user.id,
    userName: session.user.name || 'Anonymous',
    rating,
    message: message.trim(),
    status: 'pending',
  })
  await testimonial.save()
  return NextResponse.json({ success: true })
}
