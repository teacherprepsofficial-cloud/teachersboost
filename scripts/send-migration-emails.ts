/**
 * Sends the V1 migration email to all legacy TeachersBoost customers.
 * Each customer gets an individual email — no one sees other addresses.
 *
 * Usage:
 *   RESEND_API_KEY=re_... npx tsx scripts/send-migration-emails.ts
 *
 * Add --dry-run to preview without sending:
 *   RESEND_API_KEY=re_... npx tsx scripts/send-migration-emails.ts --dry-run
 */

import { Resend } from 'resend'
import * as fs from 'fs'
import * as path from 'path'

const RESEND_KEY = process.env.RESEND_API_KEY
if (!RESEND_KEY) {
  console.error('Missing RESEND_API_KEY')
  process.exit(1)
}

const resend = new Resend(RESEND_KEY)
const isDryRun = process.argv.includes('--dry-run')

const customers = [
  { name: 'Peg', email: 'pnechkash@gmail.com' },
  { name: 'Steve', email: 'steve.matheson314@gmail.com' },
  { name: 'Mary Kay', email: 'marykay@busylittlehandsblog.com' },
  { name: 'Karyn', email: 'primarilyretiredkjb@gmail.com' },
  { name: 'Victoria', email: 'victorialeogrande@gmail.com' },
  { name: 'Kyla', email: 'kyla_watson@hotmail.com' },
  { name: 'Aileen', email: 'aileen.miracle@yahoo.com' },
  { name: 'Deanna', email: 'theodoraconsultingllc@gmail.com' },
  { name: 'Jennifer', email: 'jjlucero.lucero93@gmail.com' },
  { name: 'Minette', email: 'minettealudino@gmail.com' },
  { name: 'Joan', email: 'teachandthrive@gmail.com' },
  { name: 'Yasmina', email: 'team@yasminazariouh.com' },
  { name: 'Yulia', email: 'snowkom2@gmail.com' },
  { name: 'Beth', email: 'bethbonitz@gmail.com' },
  { name: 'Ashley', email: 'abwarren910@gmail.com' },
  { name: 'Laura', email: 'laurabkelly1126@gmail.com' },
  { name: 'Kourtney', email: 'kennedyk2007@gmail.com' },
  { name: 'Michelle', email: 'educatorfantozzi@gmail.com' },
  { name: 'Holly', email: 'hollycampanelli@yahoo.com' },
  { name: 'Brijay', email: 'nicolebrijay@gmail.com' },
  { name: 'Rachel', email: 'rjoycallen@gmail.com' },
  { name: 'Rachel', email: 'rachelfarah2013@gmail.com' },
  { name: 'Lesli', email: 'leslipeterson@gmail.com' },
  { name: 'Chasity', email: 'lucimarieeducation@gmail.com' },
  { name: 'Shakiyla', email: 'gamifyedupro@gmail.com' },
  { name: 'Frances', email: 'mrsconyersmathclassroom@gmail.com' },
  { name: 'Regan', email: 'reganb82@gmail.com' },
  { name: 'Lindsay', email: 'devos.lindsay@gmail.com' },
  { name: 'Patricia', email: 'pouncey20@comcast.net' },
  { name: 'Sara', email: 'schoolingsara@gmail.com' },
  { name: 'Charnita', email: 'mschoolrush@gmail.com' },
  { name: 'Nongnuch', email: 'nongnuchlamunmon@gmail.com' },
  { name: 'Kelleth', email: 'kellethchinn@gmail.com' },
  { name: 'Jaclyn', email: 'jaclynmarie24@gmail.com' },
  { name: 'Jennifer', email: 'jenjamsam@yahoo.com' },
  { name: 'Anne', email: 'mllewilson121@gmail.com' },
  { name: 'Pam', email: 'rountreebp@comcast.net' },
  { name: 'Jessica', email: 'jwampler@wisek12.org' },
  { name: 'Bradley', email: 'brad@rempub.com' },
  { name: 'Kelly', email: 'kellys3ps@sbcglobal.net' },
  { name: 'Gladys', email: 'teachinginhighheels@gmail.com' },
  { name: 'Sandip', email: 'sandip.goon@gmail.com' },
  { name: 'Cheryl', email: 'cheryl.matas@yahoo.com' },
  { name: 'Ann', email: 'mstracylibrarian@gmail.com' },
  { name: 'Angela', email: 'angelas@posteo.de' },
  { name: 'Danielle', email: 'creativecrittertpt@gmail.com' },
  { name: 'Rina', email: 'teacherinspo123@hotmail.com' },
  { name: 'Diane', email: 'dianehines32@yahoo.com' },
  { name: 'Lucy', email: 'beyondimagiantionplay@gmail.com' },
  { name: 'LaWanda', email: 'lawandashields131@yahoo.com' },
  { name: 'Jessica', email: 'educatorjesse@outlook.com' },
  { name: 'Lisa', email: 'lisa@labineverylesson.com' },
  { name: 'Jeri', email: 'jac01342@lausd.net' },
  { name: 'Bile', email: 'bilebougpro@gmail.com' },
  { name: 'Winda', email: 'renox72202@niback.com' },
  { name: 'Carrie', email: 'hometownhappyteacher@gmail.com' },
  { name: 'Hayley', email: 'hayley@hayleyklees.com' },
  { name: 'Taryn', email: 'tarynsuniquelearning@gmail.com' },
  { name: 'Elizabeth', email: 'confessionsofafrazzledteacher@yahoo.com' },
  { name: 'Adrienne', email: 'adrienne@thelanguageartslibrary.com' },
  { name: 'Taylabarr (Test)', email: 'taylabarr@gmail.com' },
  { name: 'Elliott', email: 'elliottzelinskas@gmail.com' },
]

function buildEmail(name: string): string {
  return `Hi ${name},

Thank you for being an early TeachersBoost member. Your support means everything, and we built something better because of you.

We just launched a brand new TeachersBoost app at teachersboost.com — rebuilt from the ground up with more tools, a cleaner experience, and more ways to grow your TpT store.

As a founding member, your first month is completely free. Just sign up at teachersboost.com and enter this code at checkout:

WELCOME2026

This code expires April 6, 2026 and can be used on any plan — Boost ($9.99/month) or Pro ($14.99/month). After your free month, you'll be billed monthly and can cancel anytime.

---

A few important notes:

- Your legacy membership at members.teachersboost.com remains active — nothing changes there unless you decide to cancel it yourself
- To cancel your legacy plan, log in at members.teachersboost.com and click Cancel My Subscription
- You are under no obligation to join the new app — this is simply our way of saying thank you

---

We hope to see you on the new platform. Either way, thank you for believing in TeachersBoost from the beginning.

— Elliott
teachersboost@gmail.com`
}

async function main() {
  console.log(`${isDryRun ? '[DRY RUN] ' : ''}Sending to ${customers.length} customers...\n`)

  let sent = 0
  let failed = 0

  for (const customer of customers) {
    if (isDryRun) {
      console.log(`[DRY RUN] Would send to: ${customer.name} <${customer.email}>`)
      continue
    }

    try {
      await resend.emails.send({
        from: 'Elliott at TeachersBoost <noreply@teachersboost.com>',
        to: customer.email,
        subject: 'We built something new for you — your first month is free',
        text: buildEmail(customer.name),
      })
      console.log(`✓ Sent to ${customer.name} <${customer.email}>`)
      sent++
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    } catch (err: any) {
      console.error(`✗ Failed for ${customer.email}: ${err.message}`)
      failed++
    }
  }

  if (!isDryRun) {
    console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`)
  }
}

main().catch(console.error)
