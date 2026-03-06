'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { InfoTooltip } from '@/components/InfoTooltip'

export default function DashboardPage() {
  const [keywords, setKeywords] = useState<string[] | null>(null)
  const [kwError, setKwError] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/opportunities')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setKeywords(d.keywords || []))
      .catch(() => setKwError(true))
  }, [])

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
        <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
          <div className="bg-rose-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white text-base font-bold tracking-tight flex items-center">
                📈 Trending on TpT Right Now
                <InfoTooltip text="These are the 5 keywords being actively searched on Teachers Pay Teachers right now — updated live from TpT's own search engine." dark />
              </h2>
              <p className="text-rose-200 text-xs mt-0.5">Live from TpT search · click any keyword to research it</p>
            </div>
            <Link href="/keywords" className="text-sm text-white/80 hover:text-white font-semibold transition">
              Full Research Tool →
            </Link>
          </div>

          {kwError ? (
            <div className="px-6 py-8 text-sm text-gray-500">Could not load trending keywords. Try refreshing.</div>
          ) : keywords === null ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-5 animate-pulse flex items-center gap-6">
                  <div className="w-10 h-8 bg-gray-100 rounded" />
                  <div className="h-6 bg-gray-100 rounded w-48" />
                </div>
              ))}
            </div>
          ) : keywords.length === 0 ? (
            <div className="px-6 py-8 text-sm text-gray-500">No trending keywords found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {keywords.map((kw, i) => (
                <Link
                  key={kw}
                  href={`/keywords/${encodeURIComponent(kw)}`}
                  className={`flex items-center gap-6 px-6 py-5 group transition-colors hover:bg-rose-50 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <span className="text-3xl font-black text-gray-200 w-10 shrink-0 text-right leading-none select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-rose-700 flex-1 capitalize">
                    {kw}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 group-hover:text-rose-600 transition-colors shrink-0">
                    Research
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
