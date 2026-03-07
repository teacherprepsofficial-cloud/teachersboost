import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function GET() {
  await connectDB()
  const members = await User.countDocuments({ newsletterOnly: { $ne: true } })

  // Deterministic "online now" based on hour — realistic 2–8% of members
  const hour = new Date().getUTCHours()
  const seed = (hour * 2654435761) >>> 0
  const pct = 0.02 + (seed % 100) / 1666 // 2–8%
  const online = Math.max(2, Math.round(members * pct))

  return NextResponse.json({ members, online })
}
