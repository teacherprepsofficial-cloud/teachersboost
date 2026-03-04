'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
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
  const [sortDesc, setSortDesc] = useState(false) // ascending = best opportunity first

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const mult = sortDesc ? -1 : 1
    return typeof aVal === 'string'
      ? mult * aVal.localeCompare(bVal as string)
      : mult * ((aVal as number) - (bVal as number))
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortKey(key)
      setSortDesc(false)
    }
  }

  const Header = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 font-semibold text-sm hover:text-purple-600 transition"
    >
      {label}
      {sortKey === k &&
        (sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
    </button>
  )

  const getGrade = (competitionScore: number) => {
    if (competitionScore < 1) return { label: '🚀 Hidden Gem', color: 'text-green-600 font-bold' }
    if (competitionScore < 5) return { label: '🟡 Moderate', color: 'text-yellow-600 font-semibold' }
    if (competitionScore < 10) return { label: '🟠 Crowded', color: 'text-orange-500 font-semibold' }
    return { label: '🔴 Competitive', color: 'text-red-500 font-semibold' }
  }

  return (
    <div className="overflow-x-auto rounded-[15px] border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <Header label="Keyword" k="keyword" />
            </th>
            <th className="px-4 py-3 text-left">
              <Header label="Competition Score" k="competitionScore" />
            </th>
            <th className="px-4 py-3 text-left">
              <span className="font-semibold text-sm">Opportunity Grade</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const grade = getGrade(row.competitionScore)
            return (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-purple-50 transition"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/keywords/${encodeURIComponent(row.keyword)}`}
                    className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {row.keyword}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {row.competitionScore.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-sm ${grade.color}`}>
                  {grade.label}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
