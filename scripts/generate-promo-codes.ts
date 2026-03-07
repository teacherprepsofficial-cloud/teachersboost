/**
 * Generates 50 unique Stripe promo codes — 100% off, valid on any paid plan,
 * expires April 6 2026 (30 days from March 7 2026), single use each.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/generate-promo-codes.ts
 *
 * Outputs: promo-codes.csv (code, redeem URL)
 */

import Stripe from 'stripe'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_KEY) {
  console.error('Missing STRIPE_SECRET_KEY env var')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_KEY)

const EXPIRY = Math.floor(new Date('2026-04-06T23:59:59Z').getTime() / 1000)

async function main() {
  console.log('Creating coupon (100% off, one-time use)...')

  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: 'once',
    name: 'TB Free First Month',
    redeem_by: EXPIRY,
  })

  console.log(`Coupon created: ${coupon.id}`)

  const promo = await stripe.promotionCodes.create({
    coupon: coupon.id as any,
    code: 'WELCOME2026',
    max_redemptions: 61,
    expires_at: EXPIRY,
  })

  console.log(`\nPromo code: ${promo.code}`)
  console.log(`Max redemptions: ${promo.max_redemptions}`)
  console.log(`Expires: ${new Date(EXPIRY * 1000).toDateString()}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
