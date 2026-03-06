import { connectDB } from '../lib/db'
import { User } from '../models/User'
import emails from './newsletter-cleaned.json'

async function run() {
  await connectDB()
  const result = await User.updateMany(
    { email: { $in: (emails as string[]).map(e => e.toLowerCase()) } },
    { newsletterOnly: true }
  )
  console.log(`Marked ${result.modifiedCount} users as newsletterOnly`)
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
