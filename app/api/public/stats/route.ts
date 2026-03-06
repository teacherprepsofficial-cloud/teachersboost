import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function GET() {
  await connectDB()
  const [members, online] = await Promise.all([
    User.countDocuments({ newsletterOnly: { $ne: true } }),
    User.countDocuments({ newsletterOnly: { $ne: true }, lastSeen: { $gte: new Date(Date.now() - 15 * 60 * 1000) } }),
  ])
  return NextResponse.json({ members, online })
}
