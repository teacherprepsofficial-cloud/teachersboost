'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Loader } from 'lucide-react'

interface TopProduct {
  title: string
  url: string
  price: number
  rating: number
  ratingCount: number
  sellerName: string
}

interface BreakdownData {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
  avgPrice: number
  topProducts: TopProduct[]
}

function getGrade(resultCount: number, isRocket: boolean) {
  if (isRocket) return { label: '🚀 Hidden Gem', sub: 'Low competition — high opportunity', color: 'bg-green-50 border-green-200 text-green-800' }
  if (resultCount < 3000) return { label: '🟡 Moderate', sub: 'Some competition — still winnable', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' }
  return { label: '🔴 Competitive', sub: 'Crowded market — hard to break in', color: 'bg-red-50 border-red-200 text-red-800' }
}

export default function KeywordBreakdownPage() {
  const params = useParams()
  const keyword = decodeURIComponent(params.keyword as string)
  const [data, setData] = useState<BreakdownData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/scrape/keyword-breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        })
        if (!res.ok) throw new Error('Failed to load')
        setData(await res.json())
      } catch {
        setError('Failed to load keyword breakdown. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [keyword])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-purple-600" size={40} />
          <p className="text-gray-600 text-lg">Analyzing <strong>{keyword}</strong> on TpT...</p>
          <p className="text-gray-400 text-sm mt-1">This takes 10–20 seconds</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Link href="/keywords" className="flex items-center gap-2 text-purple-600 mb-6">
          <ArrowLeft size={18} /> Back to Keywords
        </Link>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const grade = getGrade(data.resultCount, data.isRocket)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <Link href="/keywords" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Keyword Research
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-1 capitalize">{data.keyword}</h1>
        <p className="text-gray-500 mb-8">Keyword breakdown — live from TpT</p>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`rounded-[15px] border-2 p-5 ${grade.color}`}>
            <p className="text-sm font-semibold mb-1">Opportunity Grade</p>
            <p className="text-2xl font-bold">{grade.label}</p>
            <p className="text-sm mt-1 opacity-75">{grade.sub}</p>
          </div>

          <div className="bg-white rounded-[15px] border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1">Total Products on TpT</p>
            <p className="text-3xl font-bold text-gray-900">{data.resultCount.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Competition Score: {data.competitionScore.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-[15px] border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1">Avg Price (Top Products)</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.avgPrice > 0 ? `$${data.avgPrice.toFixed(2)}` : '—'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Based on top ranking products</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-[15px] border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Top Ranking Products</h2>
          <p className="text-sm text-gray-500 mb-5">
            These are the products TpT ranks highest for <strong>"{data.keyword}"</strong>. Study them to understand what's working.
          </p>

          {data.topProducts.length === 0 ? (
            <p className="text-gray-500">Could not load top products. <a href={`https://www.teacherspayteachers.com/browse?search=${encodeURIComponent(data.keyword)}`} target="_blank" className="text-purple-600 underline">View on TpT →</a></p>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-[15px] border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-900 hover:text-purple-700 flex items-start gap-1 group"
                    >
                      <span className="line-clamp-2">{product.title}</span>
                      <ExternalLink size={14} className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                    </a>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {product.sellerName && <span>{product.sellerName}</span>}
                      {product.price > 0 && <span className="font-semibold text-gray-700">${product.price.toFixed(2)}</span>}
                      {product.rating > 0 && (
                        <span>⭐ {product.rating.toFixed(1)} ({product.ratingCount.toLocaleString()})</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <a
              href={`https://www.teacherspayteachers.com/browse?search=${encodeURIComponent(data.keyword)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
            >
              View all results on TpT <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
