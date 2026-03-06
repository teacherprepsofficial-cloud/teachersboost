'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Loader, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { KeywordTable } from '@/components/KeywordTable'
import { InfoTooltip } from '@/components/InfoTooltip'
import { UpgradeModal } from '@/components/UpgradeModal'
import { FilterPanel } from '@/components/FilterPanel'
import { SignupPromptModal } from '@/components/SignupPromptModal'

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
  if (score <= 1)  return { label: '🚀 Excellent', color: 'text-green-700',  bg: 'bg-green-100' }
  if (score <= 25) return { label: '🟢 Easy',      color: 'text-green-700',  bg: 'bg-green-100' }
  if (score <= 50) return { label: '🟠 Medium',    color: 'text-orange-600', bg: 'bg-orange-100' }
  if (score <= 75) return { label: '🔴 Hard',      color: 'text-red-600',    bg: 'bg-red-100' }
  return                  { label: '⚫ Very Hard',  color: 'text-slate-700',  bg: 'bg-slate-100' }
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
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [filterSelected, setFilterSelected] = useState<Record<string, string[]>>({})

  const handleSearch = async (kw?: string) => {
    const query = kw || searchInput
    if (!query.trim()) return
    if (!session?.user?.email) {
      setShowSignupModal(true)
      return
    }

    // Reject invalid inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const urlRegex = /^https?:\/\//i
    const profanityList = ['fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'bastard', 'damn', 'crap', 'piss', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'fag', 'retard']
    const lowerQuery = query.trim().toLowerCase()
    const hasProfanity = profanityList.some(w => lowerQuery.split(/\s+/).includes(w) || lowerQuery === w)
    if (emailRegex.test(query.trim()) || urlRegex.test(query.trim())) {
      setError('Please enter a keyword or topic — not an email address or URL.')
      return
    }
    if (hasProfanity) {
      setError('Please enter an appropriate keyword related to TpT products.')
      return
    }

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

      if (data.noResults) {
        setError('No results found on TpT for this keyword. Try a different topic.')
        return
      }

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

  const handleFilterChange = (group: string, value: string, checked: boolean) => {
    setFilterSelected(prev => {
      const current = prev[group] || []
      return {
        ...prev,
        [group]: checked ? [...current, value] : current.filter(v => v !== value),
      }
    })
  }

  const handleFilterClear = () => setFilterSelected({})

  const handleAutoSearch = (query: string) => {
    setSearchInput(query)
    handleSearch(query)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight text-center">Teachers Pay Teachers Seller Tool</h1>

        {/* Desktop subtitle */}
        <p className="hidden md:block text-xl font-bold text-rose-600 mb-3 text-center">Find profitable keywords &nbsp;|&nbsp; Optimize product listings &nbsp;|&nbsp; Boost TpT sales</p>

        {/* Mobile subtitle */}
        <div className="md:hidden flex flex-col items-center gap-1 mb-3">
          <p className="text-lg font-bold text-rose-600">🔎 Find keywords</p>
          <p className="text-lg font-bold text-rose-600">📈 Optimize listings</p>
          <p className="text-lg font-bold text-rose-600">🚀 Boost TpT sales</p>
        </div>

        {/* Desktop description */}
        <p className="hidden md:block text-sm text-slate-500 mb-8 text-center">Start by typing any keyword into the search box below. Then, go deeper by using the <span className="font-semibold text-slate-700">Find Keywords with Filters</span> box to discover more niche TpT product ideas.</p>

        {/* Mobile description */}
        <p className="md:hidden text-sm text-slate-500 mb-8 text-center">Type any keyword into the search box below to discover profitable TpT product ideas!</p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col gap-2 md:hidden">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="3rd grade math review spiral with answers"
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-[5px] focus:outline-none focus:border-rose-500 text-base font-medium bg-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-[5px] font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
              {isLoading ? 'Analyzing...' : 'Search Keywords'}
            </button>
          </div>
          {/* Desktop: side-by-side layout */}
          <div className="hidden md:flex gap-0">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="3rd grade math review spiral with answers"
              className="flex-1 px-5 py-4 border-2 border-gray-300 border-r-0 rounded-l-[5px] focus:outline-none focus:border-rose-500 text-base font-medium bg-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-r-[5px] font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
              {isLoading ? 'Analyzing...' : 'Search Keywords'}
            </button>
          </div>
        </form>

        <div className="hidden md:block">
          <FilterPanel
            selected={filterSelected}
            onChange={handleFilterChange}
            onAutoSearch={handleAutoSearch}
            onClear={handleFilterClear}
            baseKeyword={searchInput}
          />
        </div>

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
            <p className="text-sm mt-1">See competition scores, keyword difficulty, and related keyword variations</p>
          </div>
        )}

      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remaining={upgradeInfo.remaining}
        limit={upgradeInfo.limit}
      />
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </div>
  )
}
