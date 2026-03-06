import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ error: 'No STRIPE_SECRET_KEY set' })

  const keyPreview = key.substring(0, 12) + '...' + key.substring(key.length - 4)

  try {
    const stripe = new Stripe(key)
    await stripe.customers.list({ limit: 1 })
    return NextResponse.json({ ok: true, keyPreview })
  } catch (err: any) {
    return NextResponse.json({ ok: false, keyPreview, error: err?.message })
  }
}
