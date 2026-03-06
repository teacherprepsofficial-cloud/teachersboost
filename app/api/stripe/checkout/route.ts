import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import Stripe from 'stripe'

const PRICE_IDS: Record<string, string> = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
  starter_annual:  process.env.STRIPE_PRICE_STARTER_YEARLY!,
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_annual:      process.env.STRIPE_PRICE_PRO_YEARLY!,
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, billing = 'monthly' } = await req.json()
    const key = `${plan}_${billing === 'annual' ? 'annual' : 'monthly'}`

    const priceId = PRICE_IDS[key]
    if (!plan || !priceId) {
      return NextResponse.json({ error: `Invalid plan: ${key}` }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      })
      customerId = customer.id
      user.stripeCustomerId = customerId
      await user.save()
    }

    const baseUrl = 'https://teachersboost.vercel.app'

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/settings?upgraded=1`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { userId: user._id.toString(), plan },
      subscription_data: {
        metadata: { userId: user._id.toString(), plan },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('[stripe/checkout] error:', err?.message, err?.stack)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
