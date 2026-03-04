'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkCheck, Trash2 } from 'lucide-react'

interface SavedKeyword {
  keyword: string
  competitionScore: number
  resultCount: number
  createdAt: string
}

function getGrade(score: number) {
  if (score < 1)  return { label: '🚀 Hidden Gem',  color: 'text-green-600 font-bold' }
  if (score < 5)  return { label: '🟡 Moderate',    color: 'text-yellow-600 font-semibold' }
  if (score < 10) return { label: '🟠 Crowded',     color: 'text-orange-500 font-semibold' }
  return               { label: '🔴 Competitive',   color: 'text-red-500 font-semibold' }
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
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark size={20} className="text-purple-600" />
          <h1 className="text-lg font-bold text-slate-900">Saved Keywords</h1>
        </div>
        {keywords.length > 0 && (
          <p className="text-sm text-slate-400">{keywords.length} saved</p>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {toast && (
          <div className="mb-4 bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-[5px] inline-block">
            {toast}
          </div>
        )}

        {isLoading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : keywords.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-[5px] p-12 text-center">
            <BookmarkCheck size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-700 font-semibold mb-1">No saved keywords yet</p>
            <p className="text-slate-400 text-sm mb-6">Bookmark keywords from the research tool to track them here.</p>
            <Link href="/keywords" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-[5px] transition">
              Go to Keyword Research
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[5px] border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Keyword</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Competition Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Opportunity Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Results</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Remove</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((row, idx) => {
                  const grade = getGrade(row.competitionScore)
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-purple-50 transition">
                      <td className="px-4 py-3">
                        <Link href={`/keywords/${encodeURIComponent(row.keyword)}`}
                          className="font-medium text-purple-600 hover:text-purple-800 hover:underline">
                          {row.keyword}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{row.competitionScore.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-sm ${grade.color}`}>{grade.label}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{row.resultCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => remove(row.keyword)}
                          disabled={removing === row.keyword}
                          className="p-1.5 rounded-[5px] text-slate-300 hover:text-red-500 transition"
                          title="Remove bookmark"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
