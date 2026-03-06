import Stripe from 'stripe'
import { connectDB } from '../lib/db'
import { User } from '../models/User'

async function run() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const customers = await stripe.customers.list({ email: 'founderfireofficial@gmail.com', limit: 5 })
  if (!customers.data.length) {
    console.log('No Stripe customer found for this email')
    return
  }

  const customer = customers.data[0]
  console.log('Found Stripe customer:', customer.id)

  await connectDB()
  const result = await User.findOneAndUpdate(
    { email: 'founderfireofficial@gmail.com' },
    { stripeCustomerId: customer.id },
    { new: true }
  )
  console.log('Updated user:', result?.email, '→ stripeCustomerId:', result?.stripeCustomerId)
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
