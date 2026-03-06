import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Cancel Stripe subscription immediately if active
  if (user.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      await stripe.subscriptions.cancel(user.stripeSubscriptionId)
    } catch (err) {
      console.error('[delete-account] Stripe cancel error:', err)
      // Continue with deletion even if Stripe fails
    }
  }

  await User.findByIdAndDelete(session.user.id)

  return NextResponse.json({ ok: true })
}
