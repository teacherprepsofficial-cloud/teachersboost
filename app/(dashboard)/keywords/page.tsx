'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Loader } from 'lucide-react'
import { KeywordTable } from '@/components/KeywordTable'
import { UpgradeModal } from '@/components/UpgradeModal'

interface KeywordResult {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
}

export default function KeywordsPage() {
  const { data: session } = useSession()
  const [searchInput, setSearchInput] = useState('')
  const [results, setResults] = useState<KeywordResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ remaining: 0, limit: 0 })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim() || !session?.user?.id) return

    setIsLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/scrape/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchInput }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setUpgradeInfo({
          remaining: data.remaining,
          limit: data.limit,
        })
        setShowUpgradeModal(true)
        return
      }

      if (!res.ok) {
        throw new Error('Failed to search keywords')
      }

      const data = await res.json()

      // Format results including suggestions
      const allResults: KeywordResult[] = [
        {
          keyword: data.keyword,
          resultCount: data.resultCount,
          competitionScore: data.competitionScore,
          isRocket: data.isRocket,
        },
        ...data.suggestions.map((s: any) => ({
          keyword: s.keyword,
          resultCount: s.resultCount,
          competitionScore: s.competitionScore,
          isRocket: s.isRocket,
        })),
      ]

      setResults(allResults)
    } catch (err) {
      setError('Failed to fetch keyword data. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Keyword Research</h1>
        <p className="text-gray-600 mb-8">
          Discover high-opportunity keywords for your TpT products
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter a keyword (e.g., 'fractions', 'sight words')..."
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-[15px] focus:outline-none focus:border-purple-500 text-lg"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {isLoading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Results ({results.length})
            </h2>
            <KeywordTable data={results} />
          </div>
        )}

        {!results.length && !isLoading && !error && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              Search for a keyword to get started
            </p>
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
