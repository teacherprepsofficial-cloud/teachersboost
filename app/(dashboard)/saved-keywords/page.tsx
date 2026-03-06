'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookmarkCheck, Trash2 } from 'lucide-react'

interface SavedKeyword {
  keyword: string
  competitionScore: number
  resultCount: number
  createdAt: string
}

function getGrade(score: number) {
  if (score <= 1)  return { label: '🚀 Excellent', color: 'text-green-600 font-bold' }
  if (score <= 25) return { label: '🟢 Easy',      color: 'text-green-600 font-semibold' }
  if (score <= 50) return { label: '🟠 Medium',    color: 'text-orange-500 font-semibold' }
  if (score <= 75) return { label: '🔴 Hard',      color: 'text-red-500 font-semibold' }
  return                  { label: '⛔ Very Hard',  color: 'text-red-700 font-semibold' }
}

export default function SavedKeywordsPage() {
  const [keywords, setKeywords] = useState<SavedKeyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/keywords/save-full')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.saved && setKeywords(d.saved))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const remove = async (keyword: string) => {
    setRemoving(keyword)
    try {
      const res = await fetch('/api/keywords/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      if (res.ok) {
        setKeywords(prev => prev.filter(k => k.keyword !== keyword))
        setToast('Keyword removed')
        setTimeout(() => setToast(''), 2000)
      }
    } catch {}
    setRemoving(null)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8">
      <div className="max-w-2xl mx-auto">

        {toast && (
          <div className="mb-4 bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-[5px] inline-block">
            {toast}
          </div>
        )}

        {/* Legal pad notebook */}
        <div
          className="rounded-[5px] shadow-lg overflow-hidden"
          style={{ background: '#fefce8' }}
        >
          {/* Red margin line + spiral binding strip at top */}
          <div className="h-4" style={{ background: '#dc2626' }} />

          <div className="relative" style={{ background: '#fefce8' }}>
            {/* Red vertical margin line */}
            <div
              className="absolute top-0 bottom-0 left-16"
              style={{ width: '2px', background: '#fca5a5', zIndex: 1 }}
            />

            {/* Header */}
            <div className="relative z-10 px-8 pt-6 pb-4 pl-20 border-b-2" style={{ borderColor: '#93c5fd' }}>
              <h1
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: '2.6rem',
                  color: '#1e3a5f',
                  lineHeight: 1.2,
                  fontWeight: 900,
                }}
              >
                Keyword Notebook
              </h1>
              <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Georgia, serif' }}>
                {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} saved
              </p>
            </div>

            {/* Lines */}
            {isLoading ? (
              <div className="pl-20 pr-6 py-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center border-b py-3.5 animate-pulse" style={{ borderColor: '#93c5fd' }}>
                    <div className="h-4 bg-yellow-200 rounded w-48" />
                  </div>
                ))}
              </div>
            ) : keywords.length === 0 ? (
              <div className="pl-20 pr-6">
                {/* Empty ruled lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="border-b py-3.5" style={{ borderColor: '#93c5fd' }} />
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '80px' }}>
                  <BookmarkCheck size={36} className="mb-3" style={{ color: '#d1d5db' }} />
                  <p className="font-semibold text-gray-400 mb-1">Nothing saved yet</p>
                  <p className="text-sm text-gray-400 mb-4">Bookmark keywords from the explorer to save them here.</p>
                  <Link
                    href="/keywords"
                    className="pointer-events-auto bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2 rounded-[5px] transition"
                  >
                    Go to Keyword Explorer
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pl-20 pr-6">
                {keywords.map((row, idx) => {
                  const grade = getGrade(row.competitionScore)
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b group"
                      style={{ borderColor: '#93c5fd', minHeight: '48px' }}
                    >
                      {/* Line number in margin */}
                      <span
                        className="absolute text-xs select-none"
                        style={{ left: '20px', color: '#fca5a5', fontFamily: 'Georgia, serif', fontSize: '11px' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Keyword */}
                      <Link
                        href={`/keywords/${encodeURIComponent(row.keyword)}`}
                        className="flex-1 py-3 text-base hover:text-rose-600 transition capitalize"
                        style={{
                          fontSize: '0.95rem',
                          color: '#1e293b',
                          fontWeight: 500,
                        }}
                      >
                        {row.keyword}
                      </Link>

                      {/* Score + grade */}
                      <div className="flex items-center gap-4 py-3 shrink-0">
                        <span className="text-xs text-gray-400 font-mono">{Math.round(row.competitionScore)}</span>
                        <span className={`text-xs ${grade.color}`}>{grade.label}</span>
                        <button
                          onClick={() => remove(row.keyword)}
                          disabled={removing === row.keyword}
                          className="p-1 text-gray-300 hover:text-red-500 transition"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Extra blank lines at bottom — always at least 10 total lines */}
                {Array.from({ length: Math.max(0, 10 - keywords.length) }).map((_, i) => (
                  <div key={i} className="border-b py-3.5" style={{ borderColor: '#93c5fd' }} />
                ))}
              </div>
            )}

            {/* Bottom padding */}
            <div className="h-4" />
          </div>

          {/* Bottom binding strip */}
          <div className="h-3" style={{ background: '#dc2626' }} />
        </div>

      </div>
    </div>
  )
}
