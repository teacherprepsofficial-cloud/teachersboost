import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const keywords: string[] = []
    for (const result of data?.results || []) {
      for (const hit of result?.hits || []) {
        if (hit.query && !keywords.includes(hit.query)) {
          keywords.push(hit.query as string)
        }
      }
    }

    return NextResponse.json({ keywords: keywords.slice(0, 5) })
  } catch (err) {
    console.error('[opportunities]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
