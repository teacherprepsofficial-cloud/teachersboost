'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Loader, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { KeywordTable } from '@/components/KeywordTable'
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

function getGrade(score: number) {
  if (score <= 1)  return { label: '🚀 Excellent', color: 'text-green-700',  bg: 'bg-green-100' }
  if (score <= 25) return { label: '🟢 Easy',      color: 'text-green-700',  bg: 'bg-green-100' }
  if (score <= 50) return { label: '🟠 Medium',    color: 'text-orange-600', bg: 'bg-orange-100' }
  if (score <= 75) return { label: '🔴 Hard',      color: 'text-red-600',    bg: 'bg-red-100' }
  return                  { label: '⚫ Very Hard',  color: 'text-slate-700',  bg: 'bg-slate-100' }
}

export default function KeywordsPage() {
  const { data: session } = useSession()
  const [searchInput, setSearchInput] = useState('')
  const [typedKeyword, setTypedKeyword] = useState('')
  const [results, setResults] = useState<KeywordResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchingFor, setSearchingFor] = useState('')
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ remaining: 0, limit: 0 })
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [filterSelected, setFilterSelected] = useState<Record<string, string[]>>({})
  const [siteStats, setSiteStats] = useState<{ members: number; online: number } | null>(null)

  // Trending — general feed on mount, switches to search-specific after a search
  const [generalTrending, setGeneralTrending] = useState<TrendingKeyword[] | null>(null)
  const [trending, setTrending] = useState<TrendingKeyword[] | null>(null)
  const [trendingError, setTrendingError] = useState(false)
  const [trendingOpen, setTrendingOpen] = useState(true)
  const [trendingLabel, setTrendingLabel] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => setSiteStats(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/dashboard/opportunities')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        setGeneralTrending(d.keywords || [])
        setTrending(d.keywords || [])
      })
      .catch(() => setTrendingError(true))
  }, [])

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
  ]

  function containsProfanity(text: string): boolean {
    const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    return words.some(w => BANNED_WORDS.includes(w))
  }

  const handleSearch = async (kw?: string) => {
    const query = kw || searchInput
    if (!query.trim()) return
    if (containsProfanity(query)) {
      setError('Please keep searches school-appropriate. TeachersBoost is a tool for educators.')
      return
    }
    if (!session?.user?.email) {
      setShowSignupModal(true)
      return
    }

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
    setSearchingFor(kw || searchInput)
    setIsLoading(true)
    setError('')
    setResults([])

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

      // Update trending table with search-specific results
      if (data.trending && data.trending.length > 0) {
        setTrending(data.trending)
        setTrendingLabel(query)
      }
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

  const handleFilterClear = () => {
    setFilterSelected({})
    setTrending(generalTrending)
    setTrendingLabel(null)
  }

  const handleAutoSearch = (query: string) => {
    setSearchInput(query)
    handleSearch(query)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 pb-40">
      <div className="max-w-5xl mx-auto">

        {/* Mobile stats — above title */}
        {siteStats && (
          <div className="md:hidden flex items-center justify-center gap-2 mb-3 text-sm font-semibold text-slate-500">
            <span>👥 {siteStats.members.toLocaleString()} members</span>
            <span className="text-slate-300">·</span>
            <span className="text-green-600">{siteStats.online} online now</span>
          </div>
        )}

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
        <p className="hidden md:block text-sm text-slate-500 mb-8 text-center">Start by typing any keyword into the search box below. Then, go deeper by using the filter buttons to discover more niche TpT product ideas.</p>

        {/* Mobile description */}
        <p className="md:hidden text-sm text-slate-500 mb-8 text-center">Type any keyword into the search box below to discover profitable TpT product ideas!</p>

        {/* Trending on TpT — always visible, table layout */}
        <div className="mb-8 rounded-[5px] overflow-hidden border border-green-300 shadow-sm">
          {/* Header */}
          <button
            type="button"
            onClick={() => setTrendingOpen(o => !o)}
            className="no-scale w-full bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 flex items-center gap-3"
          >
            <TrendingUp size={20} className="text-white" />
            <div className="flex-1 text-left">
              <p className="text-white font-black text-base tracking-tight">TpT Trending Keywords</p>
              <p className="text-green-100 text-xs font-medium mt-0.5">
                {trendingLabel ? `Trending on TpT for "${trendingLabel}"` : 'Live from TpT! The keywords that are trending right now'}
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`text-white transition-transform duration-200 ${trendingOpen ? 'rotate-0' : '-rotate-90'}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Table */}
          {trendingOpen && <div className="bg-white">
            {trendingError ? (
              <div className="px-6 py-5 text-sm text-gray-400">Could not load trending keywords. Try refreshing.</div>
            ) : trending === null ? (
              /* Skeleton */
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded flex-1" />
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="hidden md:block h-4 bg-gray-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-green-50 border-b border-green-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Trending Keyword</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Keyword Difficulty</th>
                    <th className="hidden md:table-cell px-4 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Competition Score</th>
                  </tr>
                </thead>
                <tbody>
                  {trending.map((item, i) => {
                    const grade = getGrade(item.competitionScore)
                    return (
                      <tr key={item.keyword} className={`border-b border-gray-100 hover:bg-green-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/keywords/${encodeURIComponent(item.keyword)}`}
                            className="font-semibold text-gray-900 hover:text-green-700 hover:underline capitalize text-sm"
                          >
                            {item.keyword}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${grade.color}`}>{grade.label}</span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-sm font-bold text-gray-700">
                          {item.competitionScore.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col gap-2 md:hidden">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setTypedKeyword(e.target.value); if (error) setError('') }}
              placeholder="3rd grade math review spiral"
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
              onChange={(e) => { setSearchInput(e.target.value); setTypedKeyword(e.target.value); if (error) setError('') }}
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

        {/* Filters (desktop only) */}
        <div className="hidden md:block">
          <FilterPanel
            selected={filterSelected}
            onChange={handleFilterChange}
            onAutoSearch={handleAutoSearch}
            onClear={handleFilterClear}
            baseKeyword={typedKeyword}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-[5px] mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Matching Keywords ({results.length})
            </p>
            <KeywordTable data={results} />
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-slate-400">
            <Loader className="animate-spin mx-auto mb-3 text-rose-500" size={32} />
            <p className="text-sm font-medium">Analyzing</p>
            <p className="text-rose-500 font-bold mt-1">"{searchingFor}"</p>
            <p className="text-xs text-slate-400 mt-1">Pulling live data from TpT — takes 10–20 seconds</p>
          </div>
        )}

        {/* Empty state — shown when no search has been run and not loading */}
        {!isLoading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 select-none">
            <Search size={192} className="text-slate-200 mb-6" strokeWidth={1.5} />
            <p className="text-xl font-black text-slate-300 tracking-tight mb-1">Search any TpT keyword</p>
            <p className="text-sm text-slate-300 font-medium">Type above to see competition scores, difficulty, and niche ideas</p>
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
