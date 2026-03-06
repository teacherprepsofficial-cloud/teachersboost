import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const LIMITS = {
  keywordSearches: { free: 3, starter: Infinity, pro: Infinity, admin: Infinity },
  nicheFinder:     { free: 5, starter: Infinity, pro: Infinity, admin: Infinity },
  titleGenerator:  { free: 0, starter: 20,       pro: 75,       admin: Infinity },
  descWriter:      { free: 0, starter: 20,        pro: 75,       admin: Infinity },
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const plan = (user.plan || 'free') as keyof typeof LIMITS.keywordSearches

  // Check if weekly search count needs reset
  const now = new Date()
  const lastDate = new Date(user.dailySearchDate)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeklySearchesUsed = now.getTime() - lastDate.getTime() > msPerWeek ? 0 : user.dailySearchCount

  // Weekly reset date
  const weekResetsAt = new Date(lastDate.getTime() + msPerWeek)

  // Monthly reset (1st of next month)
  const monthResetsAt = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return NextResponse.json({
    plan,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
    subscriptionRenewalDate: user.subscriptionRenewalDate ?? null,
    hasPassword: !!user.password,
    keywordSearches: {
      used: weeklySearchesUsed,
      limit: LIMITS.keywordSearches[plan],
      period: 'week',
      resetsAt: weekResetsAt,
    },
    nicheFinder: {
      used: user.aiNicheCount,
      limit: LIMITS.nicheFinder[plan],
      period: 'month',
      resetsAt: monthResetsAt,
    },
    titleGenerator: {
      used: user.aiTitleCount,
      limit: LIMITS.titleGenerator[plan],
      period: 'month',
      resetsAt: monthResetsAt,
    },
    descWriter: {
      used: user.aiDescCount,
      limit: LIMITS.descWriter[plan],
      period: 'month',
      resetsAt: monthResetsAt,
    },
  })
}
