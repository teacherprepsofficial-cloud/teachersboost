import { User } from '@/models/User'

const DAILY_FREE_SEARCHES = 3
const DAILY_FREE_SHOPS = 1

export async function checkSearchLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  limit: number
}> {
  const user = await User.findById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  // Pro users have unlimited searches
  if (user.plan === 'pro') {
    return { allowed: true, remaining: Infinity, limit: Infinity }
  }

  // Check if the date has changed
  const now = new Date()
  const lastSearchDate = new Date(user.dailySearchDate)

  if (
    lastSearchDate.getDate() !== now.getDate() ||
    lastSearchDate.getMonth() !== now.getMonth() ||
    lastSearchDate.getFullYear() !== now.getFullYear()
  ) {
    // Reset counter
    user.dailySearchCount = 0
    user.dailySearchDate = now
    await user.save()
  }

  const allowed = user.dailySearchCount < DAILY_FREE_SEARCHES
  const remaining = Math.max(0, DAILY_FREE_SEARCHES - user.dailySearchCount)

  return {
    allowed,
    remaining,
    limit: DAILY_FREE_SEARCHES,
  }
}

export async function incrementSearchCount(userId: string): Promise<void> {
  const user = await User.findById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()
  const lastSearchDate = new Date(user.dailySearchDate)

  // Reset if date has changed
  if (
    lastSearchDate.getDate() !== now.getDate() ||
    lastSearchDate.getMonth() !== now.getMonth() ||
    lastSearchDate.getFullYear() !== now.getFullYear()
  ) {
    user.dailySearchCount = 0
    user.dailySearchDate = now
  }

  user.dailySearchCount += 1
  await user.save()
}
