import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, timezone, sellerType } = body

  await connectDB()

  const update: Record<string, string | null> = {}
  if (name) update.name = name
  if (timezone) update.timezone = timezone
  if (sellerType !== undefined) update.sellerType = sellerType

  await User.findByIdAndUpdate(session.user.id, update)

  return NextResponse.json({ ok: true })
}
