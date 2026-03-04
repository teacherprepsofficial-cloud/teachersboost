import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { SavedKeyword } from '@/models/SavedKeyword'

const SAVE_LIMITS: Record<string, number> = {
  free: 0,
  starter: 50,
  pro: 100,
  admin: Infinity,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const saved = await SavedKeyword.find({ userId: user._id }).sort({ createdAt: -1 })
  return NextResponse.json({ saved: saved.map(s => s.keyword) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyword, competitionScore, resultCount } = await req.json()
  await connectDB()

  const user = await User.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const limit = SAVE_LIMITS[user.plan] ?? 0
  if (limit === 0) {
    return NextResponse.json({ error: 'Upgrade to save keywords', upgrade: true }, { status: 403 })
  }

  const count = await SavedKeyword.countDocuments({ userId: user._id })
  if (count >= limit) {
    return NextResponse.json({ error: `Save limit reached (${limit} keywords on your plan)`, limit }, { status: 429 })
  }

  await SavedKeyword.findOneAndUpdate(
    { userId: user._id, keyword },
    { competitionScore, resultCount },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyword } = await req.json()
  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await SavedKeyword.deleteOne({ userId: user._id, keyword })
  return NextResponse.json({ ok: true })
}
