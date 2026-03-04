import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { goal, grades, storeStage } = await req.json()

  await connectDB()
  await User.findOneAndUpdate(
    { email: session.user.email },
    {
      onboardingCompleted: true,
      onboardingGoal: goal,
      onboardingGrades: grades,
      onboardingStoreStage: storeStage,
    }
  )

  return NextResponse.json({ ok: true })
}
