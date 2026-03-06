import { connectDB } from '../lib/db'
import { User } from '../models/User'

async function run() {
  await connectDB()
  const user = await User.findOne({ email: 'founderfireofficial@gmail.com' }).lean()
  console.log(JSON.stringify({
    email: (user as any)?.email,
    plan: (user as any)?.plan,
    stripeCustomerId: (user as any)?.stripeCustomerId,
    stripeSubscriptionId: (user as any)?.stripeSubscriptionId,
  }, null, 2))
  process.exit(0)
}
run().catch(e => { console.error(e); process.exit(1) })
