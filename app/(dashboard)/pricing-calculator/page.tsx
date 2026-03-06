'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { DollarSign, TrendingUp } from 'lucide-react'

const PRODUCT_TYPES = ['Worksheets', 'Activities', 'Unit Plan', 'Lesson Plan', 'Task Cards', 'Bundle', 'Assessment / Test', 'Quiz', 'Game', 'Posters / Anchor Charts', 'Digital Activity', 'Graphic Organizer', 'Flash Cards', 'Notebook / Journal']

export default function PricingSuggesterPage() {
  const { data: session } = useSession()
  const [keyword, setKeyword] = useState('')
  const [productType, setProductType] = useState('')
  const [pageCount, setPageCount] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!keyword.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/tools/price-suggester', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, productType, pageCount }),
    })
    const d = await res.json()
    if (!res.ok) setError(d.error || 'Something went wrong')
    else setResult(d)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="bg-[#0f172a] px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white text-3xl font-black tracking-tight">Price Suggester</h1>
          <p className="text-slate-400 text-sm mt-1">Get a data-backed price recommendation based on real TpT market prices</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">

        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Keyword / Topic <span className="text-red-500">*</span></label>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="e.g. fractions worksheets, reading comprehension"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Type</label>
              <select
                value={productType}
                onChange={e => setProductType(e.target.value)}
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Select type...</option>
                {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Page Count</label>
              <input
                type="number"
                value={pageCount}
                onChange={e => setPageCount(e.target.value)}
                placeholder="e.g. 20"
                min="1"
                className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={loading || !keyword.trim()}
            className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <TrendingUp size={16} />
            {loading ? 'Analyzing market...' : 'Get Price Recommendation'}
          </button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>

        {result && (
          <div className="space-y-4">
            {/* Recommended price hero */}
            <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
              <div className="bg-[#0f172a] px-5 py-3">
                <h2 className="text-white font-bold text-sm">Recommended Price</h2>
              </div>
              <div className="p-6 flex items-center gap-6">
                <div className="flex items-center gap-1 text-5xl font-black text-rose-600">
                  <DollarSign size={36} strokeWidth={3} />
                  {result.recommended.toFixed(2)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Based on {result.sampleSize > 0 ? `${result.sampleSize} real TpT listings` : 'product type & page count'}</p>
                  <p className="text-xs text-slate-400">Searching: "{result.keyword}"</p>
                </div>
              </div>
            </div>

            {/* Market data */}
            {result.marketAvg && (
              <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-gray-900">Market Data from TpT</h3>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="p-5 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Market Average</p>
                    <p className="text-2xl font-black text-gray-800">${result.marketAvg.toFixed(2)}</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Lowest Price</p>
                    <p className="text-2xl font-black text-green-600">${result.marketMin.toFixed(2)}</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Highest Price</p>
                    <p className="text-2xl font-black text-gray-800">${result.marketMax.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              Prices are scraped live from TpT search results. Use as a starting point — your final price should reflect your product's quality and depth.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
