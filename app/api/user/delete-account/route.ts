import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { SavedKeyword } from '@/models/SavedKeyword'
import { Testimonial } from '@/models/Testimonial'
import { Feedback } from '@/models/Feedback'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const userId = session.user.id

  // Delete all user data
  await Promise.all([
    User.findByIdAndDelete(userId),
    SavedKeyword.deleteMany({ userId }),
    Testimonial.deleteMany({ userId }),
    Feedback.deleteMany({ userId }),
  ])

  return NextResponse.json({ success: true })
}
