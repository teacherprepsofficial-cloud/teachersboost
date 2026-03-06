import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await connectDB()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      const subscriptionId = session.subscription as string

      if (!userId || !plan) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const renewalDate = new Date(((subscription as any).current_period_end ?? 0) * 1000)

      await User.findByIdAndUpdate(userId, {
        plan,
        stripeSubscriptionId: subscriptionId,
        subscriptionRenewalDate: renewalDate,
        cancelledAt: null,
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      const plan = subscription.metadata?.plan
      const renewalDate = new Date(((subscription as any).current_period_end ?? 0) * 1000)
      const status = subscription.status

      if (status === 'active' && plan) {
        await User.findByIdAndUpdate(userId, {
          plan,
          stripeSubscriptionId: subscription.id,
          subscriptionRenewalDate: renewalDate,
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      await User.findByIdAndUpdate(userId, {
        plan: 'free',
        stripeSubscriptionId: null,
        subscriptionRenewalDate: null,
        cancelledAt: new Date(),
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      // Optionally: send email to user about failed payment
      console.warn('[webhook] payment failed for customer:', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
