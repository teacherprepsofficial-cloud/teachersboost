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
import * as fs from 'fs'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_KEY) {
  console.error('Missing STRIPE_SECRET_KEY env var')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_KEY)

const EXPIRY = Math.floor(new Date('2026-04-06T23:59:59Z').getTime() / 1000)
const COUNT = 50

async function main() {
  console.log('Creating coupon (100% off, one-time use)...')

  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: 'once',
    name: 'TeachersBoost — Free Month (V1 Migration)',
    redeem_by: EXPIRY,
  })

  console.log(`Coupon created: ${coupon.id}`)
  console.log(`Generating ${COUNT} unique promo codes...`)

  const codes: string[] = []

  for (let i = 0; i < COUNT; i++) {
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      max_redemptions: 1,
      expires_at: EXPIRY,
    })
    codes.push(promo.code)
    process.stdout.write(`\r${i + 1}/${COUNT}`)
  }

  console.log('\nDone! Writing promo-codes.csv...')

  const rows = ['Code,Signup URL']
  for (const code of codes) {
    rows.push(`${code},https://teachersboost.com/signup?promo=${code}`)
  }

  fs.writeFileSync('promo-codes.csv', rows.join('\n'))
  console.log('Saved to promo-codes.csv')
  console.log(`\nCoupon ID: ${coupon.id} — expires April 6 2026`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
