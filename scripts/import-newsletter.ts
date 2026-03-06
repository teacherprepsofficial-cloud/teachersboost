import { connectDB } from '../lib/db'
import { User } from '../models/User'
import emails from './newsletter-cleaned.json'

async function run() {
  await connectDB()

  let added = 0
  let skipped = 0

  for (const email of emails as string[]) {
    const exists = await User.findOne({ email })
    if (exists) {
      // If they already have an account, just make sure emailOptIn is true
      if (!exists.emailOptIn) {
        await User.updateOne({ email }, { emailOptIn: true })
        console.log('Updated opt-in:', email)
      }
      skipped++
      continue
    }

    await User.create({
      email,
      name: 'TpT Seller',
      plan: 'free',
      emailVerified: false,
      emailOptIn: true,
      onboardingCompleted: false,
      dailySearchCount: 0,
      dailySearchDate: new Date(),
      aiTitleCount: 0,
      aiDescCount: 0,
      aiNicheCount: 0,
      aiUsageMonth: '',
      timezone: 'America/New_York',
    })
    added++
    console.log('Added:', email)
  }

  console.log(`\nDone. Added: ${added}, Already existed: ${skipped}`)
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
