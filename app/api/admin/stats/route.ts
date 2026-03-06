import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const ADMIN_EMAILS = ['teachersboost@gmail.com', 'elliottzelinskas@gmail.com']

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [dailyCount, mtdCount, lifetimeCount, recentSignups, recentCancellations] =
    await Promise.all([
      User.countDocuments({ newsletterOnly: { $ne: true }, createdAt: { $gte: todayStart } }),
      User.countDocuments({ newsletterOnly: { $ne: true }, createdAt: { $gte: monthStart } }),
      User.countDocuments({ newsletterOnly: { $ne: true } }),
      User.find({ newsletterOnly: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(25)
        .select('name email plan createdAt')
        .lean(),
      User.find({ cancelledAt: { $exists: true, $ne: null } })
        .sort({ cancelledAt: -1 })
        .limit(25)
        .select('name email cancelledAt')
        .lean(),
    ])

  return NextResponse.json({
    dailyCount,
    mtdCount,
    lifetimeCount,
    recentSignups,
    recentCancellations,
  })
}
