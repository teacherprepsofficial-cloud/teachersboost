'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Loader, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { KeywordTable } from '@/components/KeywordTable'
import { UpgradeModal } from '@/components/UpgradeModal'

interface KeywordResult {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
}

interface TrendingKeyword {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
}

function getTrendingGrade(score: number) {
  if (score < 1)  return { label: '🚀 Hidden Gem',  color: 'text-green-700',  bg: 'bg-green-100' }
  if (score < 5)  return { label: '🟡 Moderate',    color: 'text-yellow-700', bg: 'bg-yellow-100' }
  if (score < 10) return { label: '🟠 Crowded',     color: 'text-orange-600', bg: 'bg-orange-100' }
  return               { label: '🔴 Competitive',   color: 'text-red-600',    bg: 'bg-red-100' }
}

export default function KeywordsPage() {
  const { data: session } = useSession()
  const [searchInput, setSearchInput] = useState('')
  const [results, setResults] = useState<KeywordResult[]>([])
  const [trending, setTrending] = useState<TrendingKeyword[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ remaining: 0, limit: 0 })

  const handleSearch = async (kw?: string) => {
    const query = kw || searchInput
    if (!query.trim() || !session?.user?.email) return

    if (kw) setSearchInput(kw)
    setIsLoading(true)
    setError('')
    setResults([])
    setTrending([])

    try {
      const res = await fetch('/api/scrape/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: query }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setUpgradeInfo({ remaining: data.remaining, limit: data.limit })
        setShowUpgradeModal(true)
        return
      }

      if (!res.ok) throw new Error('Failed')

      const data = await res.json()

      setResults([
        { keyword: data.keyword, resultCount: data.resultCount, competitionScore: data.competitionScore, isRocket: data.isRocket },
        ...(data.suggestions || []).map((s: any) => ({
          keyword: s.keyword, resultCount: s.resultCount, competitionScore: s.competitionScore, isRocket: s.isRocket,
        })),
      ])
      setTrending(data.trending || [])
    } catch {
      setError('Failed to fetch keyword data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-extrabold text-slate-900 mb-1">Keyword Research</h1>
        <p className="text-slate-400 text-sm mb-8 uppercase tracking-wide">Discover high-opportunity keywords for your TpT products</p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-0">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter a keyword — e.g. 'fractions', 'American Revolution'..."
              className="flex-1 px-5 py-4 border-2 border-gray-300 border-r-0 rounded-l-[5px] focus:outline-none focus:border-purple-500 text-base font-medium bg-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-r-[5px] font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
              {isLoading ? 'Analyzing...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-[5px] mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            {/* Trending Keywords */}
            {trending.length > 0 && (
              <div className="mb-5 rounded-[5px] overflow-hidden border border-green-300 shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 flex items-center gap-3">
                  <TrendingUp size={20} className="text-white" />
                  <div>
                    <p className="text-white font-black text-base tracking-tight">Trending on TpT Right Now</p>
                    <p className="text-green-100 text-xs font-medium mt-0.5">Live from TpT's search autocomplete — what teachers are searching today</p>
                  </div>
                </div>
                {/* Cards */}
                <div className="bg-green-50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trending.map((item) => {
                    const grade = getTrendingGrade(item.competitionScore)
                    return (
                      <Link
                        key={item.keyword}
                        href={`/keywords/${encodeURIComponent(item.keyword)}`}
                        className="bg-white border border-green-200 hover:border-green-400 hover:shadow-md rounded-[5px] p-4 transition group block"
                      >
                        <p className="font-bold text-slate-800 group-hover:text-green-700 text-sm mb-3 capitalize leading-snug">{item.keyword}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Competition</p>
                            <p className="text-lg font-black text-slate-900">{item.competitionScore.toFixed(2)}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-[5px] ${grade.bg} ${grade.color}`}>
                            {grade.label}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Results Table */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Matching Keywords ({results.length})
              </p>
              <KeywordTable data={results} />
            </div>
          </div>
        )}

        {!results.length && !isLoading && !error && (
          <div className="text-center py-20 text-slate-400">
            <Search size={52} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Enter a keyword above to get started</p>
            <p className="text-sm mt-1">See competition scores, trending variations, and pricing data</p>
          </div>
        )}

      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remaining={upgradeInfo.remaining}
        limit={upgradeInfo.limit}
      />
    </div>
  )
}
