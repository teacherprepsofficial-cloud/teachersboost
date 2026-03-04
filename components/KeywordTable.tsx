'use client'

import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Bookmark, BookmarkCheck } from 'lucide-react'
import Link from 'next/link'

interface KeywordResult {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
}

interface KeywordTableProps {
  data: KeywordResult[]
}

type SortKey = 'keyword' | 'competitionScore'

export function KeywordTable({ data }: KeywordTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('competitionScore')
  const [sortDesc, setSortDesc] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState('')


  useEffect(() => {
    fetch('/api/keywords/save')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.saved && setSaved(new Set(d.saved)))
      .catch(() => {})
  }, [])

  const toggleSave = async (row: KeywordResult) => {
    setSaving(row.keyword)
    const isSaved = saved.has(row.keyword)
    try {
      const res = await fetch('/api/keywords/save', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: row.keyword, competitionScore: row.competitionScore, resultCount: row.resultCount }),
      })
      const d = await res.json()
      if (!res.ok) {
        setToast(d.error || 'Could not save keyword')
        setTimeout(() => setToast(''), 3500)
      } else {
        setSaved(prev => {
          const next = new Set(prev)
          isSaved ? next.delete(row.keyword) : next.add(row.keyword)
          return next
        })
        setToast(isSaved ? 'Keyword removed' : 'Keyword saved!')
        setTimeout(() => setToast(''), 2000)
      }
    } catch {}
    setSaving(null)
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey], bVal = b[sortKey]
    const mult = sortDesc ? -1 : 1
    return typeof aVal === 'string' ? mult * aVal.localeCompare(bVal as string) : mult * ((aVal as number) - (bVal as number))
  })

  const Header = ({ label, k }: { label: string; k: SortKey }) => (
    <button onClick={() => { sortKey === k ? setSortDesc(!sortDesc) : (setSortKey(k), setSortDesc(false)) }}
      className="flex items-center gap-1 font-semibold text-sm hover:text-purple-600 transition">
      {label}
      {sortKey === k && (sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
    </button>
  )

  const getGrade = (score: number) => {
    if (score < 1)  return { label: '🚀 Hidden Gem', color: 'text-green-600 font-bold' }
    if (score < 5)  return { label: '🟡 Moderate',   color: 'text-yellow-600 font-semibold' }
    if (score < 10) return { label: '🟠 Crowded',    color: 'text-orange-500 font-semibold' }
    return               { label: '🔴 Competitive',  color: 'text-red-500 font-semibold' }
  }

  return (
    <div className="relative">
      {toast && (
        <div className="absolute -top-10 left-0 bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-[5px] z-10">
          {toast}
        </div>
      )}
      <div className="overflow-x-auto rounded-[5px] border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left"><Header label="Matching Keywords" k="keyword" /></th>
              <th className="px-4 py-3 text-left"><Header label="Competition Score" k="competitionScore" /></th>
              <th className="px-4 py-3 text-left"><span className="font-semibold text-sm">Opportunity Grade</span></th>
              <th className="px-4 py-3 text-right"><span className="font-semibold text-sm text-slate-400">Save</span></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const grade = getGrade(row.competitionScore)
              const isSaved = saved.has(row.keyword)
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
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleSave(row)}
                      disabled={saving === row.keyword}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark this keyword'}
                      className={`p-1.5 rounded-[5px] transition ${isSaved ? 'text-purple-600 bg-purple-50' : 'text-slate-300 hover:text-purple-500'}`}
                    >
                      {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
