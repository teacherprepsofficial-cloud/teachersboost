import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { BlogCache } from '@/models/BlogCache'

const RSS_URL = 'https://blog.teacherspayteachers.com/feed/'

async function fetchBlogPosts() {
  const res = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error('Failed to fetch RSS')
  const xml = await res.text()

  const items: { title: string; url: string; publishedAt: Date; excerpt: string }[] = []

  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const match of itemMatches) {
    const block = match[1]
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      || block.match(/<title>(.*?)<\/title>/)?.[1]
      || ''
    const url = block.match(/<link>(.*?)<\/link>/)?.[1]
      || block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1]
      || ''
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
      || block.match(/<description>([\s\S]*?)<\/description>/)?.[1]
      || ''

    if (title && url) {
      // Strip HTML tags from excerpt
      const excerpt = desc.replace(/<[^>]+>/g, '').slice(0, 160).trim()
      items.push({
        title: title.trim(),
        url: url.trim(),
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        excerpt,
      })
    }
    if (items.length >= 3) break
  }

  return items
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const cached = await BlogCache.findOne().sort({ cachedAt: -1 })
  if (cached) {
    const ageHours = (Date.now() - cached.cachedAt.getTime()) / 3_600_000
    if (ageHours < 6) {
      return NextResponse.json({ posts: cached.posts })
    }
  }

  const posts = await fetchBlogPosts()

  await BlogCache.create({ posts, cachedAt: new Date() })

  return NextResponse.json({ posts })
}
