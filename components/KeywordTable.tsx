'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface KeywordResult {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
  avgPrice?: number
  avgViews24h?: number
  optimalPrice?: number
}

interface KeywordTableProps {
  data: KeywordResult[]
  onKeywordSelect?: (keyword: string) => void
}

type SortKey = 'keyword' | 'competitionScore' | 'avgPrice' | 'avgViews24h' | 'resultCount'

export function KeywordTable({ data, onKeywordSelect }: KeywordTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('competitionScore')
  const [sortDesc, setSortDesc] = useState(true)

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey] || 0
    const bVal = b[sortKey] || 0
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
      setSortDesc(true)
    }
  }

  const Header = ({ label, key }: { label: string; key: SortKey }) => (
    <button
      onClick={() => toggleSort(key)}
      className="flex items-center gap-1 font-semibold text-sm hover:bg-gray-100 px-2 py-1 rounded"
    >
      {label}
      {sortKey === key &&
        (sortDesc ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
    </button>
  )

  return (
    <div className="overflow-x-auto rounded-[15px] border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <Header label="Keyword" key="keyword" />
            </th>
            <th className="px-4 py-3 text-right">
              <Header label="Competition" key="competitionScore" />
            </th>
            <th className="px-4 py-3 text-right">
              <Header label="Results" key="resultCount" />
            </th>
            <th className="px-4 py-3 text-right">
              <Header label="Avg Price" key="avgPrice" />
            </th>
            <th className="px-4 py-3 text-right">
              <Header label="Views/24h" key="avgViews24h" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => onKeywordSelect?.(row.keyword)}
            >
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  {row.isRocket && <span>🚀</span>}
                  <span className="font-medium text-gray-900">{row.keyword}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-purple-600">
                  {row.competitionScore.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-600">
                {row.resultCount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-600">
                {row.avgPrice ? `$${row.avgPrice.toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-600">
                {row.avgViews24h ? row.avgViews24h.toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
