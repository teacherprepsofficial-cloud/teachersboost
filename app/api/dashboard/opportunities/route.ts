import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scrapeKeywordSuggestions, scrapeKeywordResults } from '@/lib/scraper'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // Allow unauthenticated access — just default to teacher-seller
    const sellerType = (session?.user as any)?.sellerType || 'teacher-seller'

    const queries =
      sellerType === 'seller-to-sellers'
        ? [
            { indexName: 'Resource Suggestions', params: 'hitsPerPage=5&query=clip+art' },
            { indexName: 'Resource Suggestions', params: 'hitsPerPage=5&query=templates' },
          ]
        : [
            { indexName: 'Resource Suggestions', params: 'hitsPerPage=5&query=' },
          ]

    const res = await fetch('https://sbekgjsj8m-3.algolianet.com/1/indexes/*/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-api-key': 'ce17b545c6ba0432cf638e0c29ee64ef',
        'x-algolia-application-id': 'SBEKGJSJ8M',
      },
      body: JSON.stringify({ requests: queries }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Algolia error' }, { status: 502 })
    }

    const data = await res.json()
    const rawKeywords: string[] = []
    for (const result of data?.results || []) {
      for (const hit of result?.hits || []) {
        if (hit.query && !rawKeywords.includes(hit.query)) {
          rawKeywords.push(hit.query as string)
        }
      }
    }

    const keywords = rawKeywords.slice(0, 5)

    // Fetch competition scores for each keyword in parallel
    const keywordsWithScores = await Promise.all(
      keywords.map(async (kw) => {
        const r = await scrapeKeywordResults(kw)
        return {
          keyword: kw,
          resultCount: r.resultCount,
          competitionScore: r.competitionScore,
          isRocket: r.isRocket,
        }
      })
    )

    return NextResponse.json({ keywords: keywordsWithScores })
  } catch (err) {
    console.error('[opportunities]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
