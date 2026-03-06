const fs = require('fs')

const CSV = '/Users/elliottzelinskas/Downloads/emailoctopus-export-consumer-list-af11388e-9889-11f0-afbf-6b77caa4c9a5-filter-1772833489.csv'

const DISPOSABLE = ['mailinator','guerrillamail','tempmail','throwam','trashmail','yopmail','sharklasers','dispostable','maildrop','spamgourmet','setxko','getairmail','fakeinbox','spamex','spam4','mytemp','tempr.email','discard.email','mailnull','spamcero','zetmail','nwldx','xcode','trbvm','byom','dodgit','pjjkp','cuvox','fleckens','gustr','superrito','teleworm','dayrep','rhyta','armyspy','crapmail','einrot','flurre','gishpuppy','harakirimail','hulapla','klzlk','kurzepost','lroid','put2','sogetthis','suremail','tafmail','tilrem','uvioo','veryrealemail','viditag','wetrainbayarea','wilemail','wolfsmail','yapped','yevme']

const BOGUS_DOMAINS = ['test.com','example.com','asdf.com','qwerty.com','fake.com','noemail.com','none.com','null.com','invalid.com','domain.com']

const TYPO_DOMAINS = {
  'gmial.com':'gmail.com','gmaill.com':'gmail.com','gnail.com':'gmail.com',
  'yahooo.com':'yahoo.com','yaho.com':'yahoo.com','yhoo.com':'yahoo.com',
  'hotmial.com':'hotmail.com','hotamail.com':'hotmail.com','hotmal.com':'hotmail.com',
  'outlok.com':'outlook.com'
}

const lines = fs.readFileSync(CSV, 'utf8').split('\n').slice(1).filter(l => l.trim())

const removed = []
const typoFixed = []
const kept = []
const seen = new Set()

for (const line of lines) {
  const parts = line.split(',')
  const raw = (parts[1] || '').replace(/"/g,'').trim().toLowerCase()
  if (!raw || !raw.includes('@')) continue

  const atIdx = raw.lastIndexOf('@')
  const user = raw.slice(0, atIdx)
  const domain = raw.slice(atIdx + 1)
  if (!domain) continue

  const correctedDomain = TYPO_DOMAINS[domain] || domain
  const email = user + '@' + correctedDomain

  if (correctedDomain !== domain) {
    typoFixed.push({ original: raw, fixed: email })
  }

  if (seen.has(email)) { removed.push({ email: raw, reason: 'duplicate' }); continue }
  seen.add(email)

  if (DISPOSABLE.some(d => domain.includes(d))) { removed.push({ email: raw, reason: 'disposable/spam domain' }); continue }
  if (BOGUS_DOMAINS.includes(domain)) { removed.push({ email: raw, reason: 'bogus domain' }); continue }

  const dots = (user.match(/\./g) || []).length
  if (dots >= 5) { removed.push({ email: raw, reason: 'suspicious (too many dots)' }); continue }

  kept.push(email)
}

console.log('KEPT:', kept.length)
console.log('REMOVED:', removed.length)
console.log('TYPO FIXED:', typoFixed.length)
console.log('\nREMOVED LIST:')
removed.forEach(r => console.log(' -', r.email, '|', r.reason))
if (typoFixed.length) {
  console.log('\nTYPO FIXES:')
  typoFixed.forEach(t => console.log(' -', t.original, '->', t.fixed))
}

// Save cleaned list
fs.writeFileSync('/Users/elliottzelinskas/teachersboost/scripts/newsletter-cleaned.json', JSON.stringify(kept, null, 2))
console.log('\nSaved to scripts/newsletter-cleaned.json')
