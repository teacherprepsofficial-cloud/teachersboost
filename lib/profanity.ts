const BANNED_WORDS = [
  'fuck','fucker','fucking','fucked','fück',
  'shit','shitting','shitter','bullshit',
  'bitch','bitches','bitching',
  'ass','asshole','asses',
  'dick','dicks','dickhead',
  'cock','cocks','cocksucker',
  'pussy','pussies',
  'cunt','cunts',
  'bastard','bastards',
  'damn','damnit',
  'hell',
  'nigger','nigga','niggas',
  'faggot','fag','fags',
  'whore','whores',
  'slut','sluts',
  'piss','pissed',
  'porn','porno',
  'sex','sexy','sexting',
  'rape','rapist',
  'motherfucker','motherfucking',
  'jackass','dumbass','smartass',
  'retard','retarded',
]

export function containsProfanity(text: string): boolean {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
  return words.some(w => BANNED_WORDS.includes(w))
}

export const PROFANITY_ERROR = 'Please keep it school-appropriate. TeachersBoost is a tool for educators.'
