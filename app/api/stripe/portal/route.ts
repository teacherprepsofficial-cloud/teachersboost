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

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: 'https://teachersboost.vercel.app/settings',
    })
    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error('[portal] Stripe error:', err?.message, err?.code, err?.type)
    return NextResponse.json({ error: err?.message || 'Could not open billing portal.' }, { status: 500 })
  }
}
