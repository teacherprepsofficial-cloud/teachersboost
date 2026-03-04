import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { SavedKeyword } from '@/models/SavedKeyword'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const saved = await SavedKeyword.find({ userId: user._id }).sort({ createdAt: -1 })
  return NextResponse.json({
    saved: saved.map(s => ({
      keyword: s.keyword,
      competitionScore: s.competitionScore,
      resultCount: s.resultCount,
      createdAt: s.createdAt,
    }))
  })
}
