import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // If Stripe is integrated and user has a subscription, cancel it
  if (user.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      await stripe.subscriptions.cancel(user.stripeSubscriptionId)
    } catch (err) {
      console.error('[cancel] Stripe error:', err)
      // Continue to downgrade locally even if Stripe fails
    }
  }

  // Downgrade to free
  user.plan = 'free'
  user.stripeSubscriptionId = undefined
  user.subscriptionRenewalDate = undefined
  user.cancelledAt = new Date()
  await user.save()

  return NextResponse.json({ ok: true })
}
