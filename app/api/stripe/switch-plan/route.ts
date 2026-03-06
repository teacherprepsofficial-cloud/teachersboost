import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

// Same env var names as /api/stripe/checkout/route.ts
const PRICE_IDS: Record<string, string> = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
  starter_annual:  process.env.STRIPE_PRICE_STARTER_YEARLY  || '',
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY     || '',
  pro_annual:      process.env.STRIPE_PRICE_PRO_YEARLY      || '',
}

// Derive plan name ('starter'|'pro') from the price key
function planFromKey(key: string): string {
  if (key.startsWith('pro')) return 'pro'
  return 'starter'
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json()
  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!user.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
    const item = subscription.items.data[0]

    const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ id: item.id, price: priceId }],
      proration_behavior: 'always_invoice',
      cancel_at_period_end: false,
      // Update subscription metadata so webhook also gets the right plan
      metadata: { userId: user._id.toString(), plan: planFromKey(plan) },
    })

    // Also update MongoDB directly — don't rely solely on webhook
    const renewalDate = new Date(((updated as any).current_period_end ?? 0) * 1000)
    user.plan = planFromKey(plan) as 'starter' | 'pro'
    user.subscriptionRenewalDate = renewalDate
    user.cancelAtPeriodEnd = false
    await user.save()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[switch-plan] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to switch plan.' }, { status: 500 })
  }
}
