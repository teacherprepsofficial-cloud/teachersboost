'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Loader, Bookmark, BookmarkCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface MatchingKeyword {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
}

interface CompetitionLink {
  label: string
  icon: string
  title: string | null
  url: string
}

interface BreakdownData {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
  topProducts: { title: string; url: string; price: number; rating: number; ratingCount: number; sellerName: string }[]
  competitionLinks: CompetitionLink[]
  matchingKeywords: MatchingKeyword[]
}

function getGrade(score: number) {
  if (score < 1)  return { label: '🚀 Hidden Gem',  sub: 'Low competition — high opportunity',           fill: '#22c55e', badge: 'bg-green-100 text-green-800 border-green-200',  color: 'text-green-600 font-bold'       }
  if (score < 5)  return { label: '🟡 Moderate',    sub: 'Some competition — still very winnable',       fill: '#eab308', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', color: 'text-yellow-600 font-semibold'  }
  if (score < 10) return { label: '🟠 Crowded',     sub: 'High competition — strong product required',   fill: '#f97316', badge: 'bg-orange-100 text-orange-800 border-orange-200', color: 'text-orange-500 font-semibold'  }
  return           { label: '🔴 Competitive',        sub: 'Saturated market — very hard to rank',         fill: '#ef4444', badge: 'bg-red-100 text-red-800 border-red-200',           color: 'text-red-500 font-semibold'     }
}

function CompetitionMeter({ score }: { score: number }) {
  const MAX = 20
  // INVERTED: low score = high opportunity = needle points RIGHT (good/green side)
  const pct = 1 - Math.min(score, MAX) / MAX
  const grade = getGrade(score)

  const cx = 150, cy = 130, r = 100, sw = 28

  const toXY = (p: number) => ({
    x: cx + r * Math.cos(Math.PI - p * Math.PI),
    y: cy - r * Math.sin(p * Math.PI),
  })

  const arc = (from: number, to: number) => {
    const p1 = toXY(from), p2 = toXY(to)
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${to - from > 0.5 ? 1 : 0} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }

  const needle = toXY(pct)
  // Needle tip shortened to sit on arc edge
  const needleTip = {
    x: cx + (r - 2) * Math.cos(Math.PI - pct * Math.PI),
    y: cy - (r - 2) * Math.sin(pct * Math.PI),
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-xl font-black text-slate-900 tracking-tight mb-3 self-start">Competition Score</p>
      <div className="relative w-full flex flex-col items-center">
        <svg width="300" height="165" viewBox="0 0 300 165">
          {/* Gray track */}
          <path d={arc(0, 1)} fill="none" stroke="#e5e7eb" strokeWidth={sw} strokeLinecap="butt" />
          {/* Colored fill from RIGHT back to needle */}
          {pct > 0 && (
            <path d={arc(1 - pct, 1)} fill="none" stroke={grade.fill} strokeWidth={sw} strokeLinecap="butt" />
          )}
          {/* LOW label (left = bad) */}
          <text x="10" y="148" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" fontFamily="system-ui,sans-serif">HIGH</text>
          {/* HIGH label (right = good) */}
          <text x="290" y="148" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" fontFamily="system-ui,sans-serif">LOW</text>
          {/* Needle */}
          <line
            x1={cx} y1={cy}
            x2={needleTip.x.toFixed(2)} y2={needleTip.y.toFixed(2)}
            stroke="#0f172a" strokeWidth="4" strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="8" fill="#0f172a" />
        </svg>
        {/* Score number below arc */}
        <div className="mt-1 text-center">
          <p className="text-6xl font-black text-slate-900 leading-none">{score.toFixed(1)}</p>
        </div>
      </div>
      <span className={`inline-block px-5 py-2 border rounded-[5px] text-base font-black mt-4 ${grade.badge}`}>
        {grade.label}
      </span>
      <p className="text-sm text-slate-500 mt-2">{grade.sub}</p>
    </div>
  )
}

export default function KeywordBreakdownPage() {
  const params = useParams()
  const keyword = decodeURIComponent(params.keyword as string)
  const { data: session } = useSession()

  const [data, setData] = useState<BreakdownData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/keywords/save')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.saved && setIsSaved(d.saved.includes(keyword)))
      .catch(() => {})
  }, [keyword])

  const toggleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/keywords/save', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, competitionScore: data?.competitionScore, resultCount: data?.resultCount }),
      })
      const d = await res.json()
      if (!res.ok) { setToast(d.error || 'Could not save'); setTimeout(() => setToast(''), 3500) }
      else { setIsSaved(!isSaved); setToast(isSaved ? 'Removed from saved' : 'Keyword saved!'); setTimeout(() => setToast(''), 2000) }
    } catch {}
    setSaving(false)
  }

  useEffect(() => {
    fetch('/api/scrape/keyword-breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword }),
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(setData)
      .catch(() => setError('Failed to load keyword breakdown. Please try again.'))
      .finally(() => setIsLoading(false))
  }, [keyword])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-5 text-purple-600" size={48} />
          <p className="text-slate-800 text-2xl font-bold">Analyzing <span className="text-purple-600">"{keyword}"</span></p>
          <p className="text-slate-400 text-sm mt-2">Pulling live data from TpT — takes 10–20 seconds</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-8">
        <Link href="/keywords" className="flex items-center gap-2 text-purple-600 mb-6 text-sm font-semibold">
          <ArrowLeft size={16} /> Back
        </Link>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const grade = getGrade(data.competitionScore)

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <Link href="/keywords" className="flex items-center gap-2 text-slate-500 hover:text-purple-600 text-sm font-medium transition">
          <ArrowLeft size={15} /> Keyword Research
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold text-sm capitalize">{data.keyword}</span>
      </div>

      <div className="max-w-6xl mx-auto p-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-1 capitalize">{data.keyword}</h1>
            <p className="text-slate-400 text-sm tracking-wide uppercase">Live analysis · TpT keyword data</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={toggleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[5px] border text-sm font-bold transition ${
                isSaved
                  ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
                  : 'bg-white border-gray-200 text-slate-600 hover:border-purple-400 hover:text-purple-600'
              }`}
            >
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {isSaved ? 'Saved' : 'Save Keyword'}
            </button>
            {toast && <p className="text-xs text-slate-500">{toast}</p>}
          </div>
        </div>

        {/* ── MAIN ANALYTICS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

          {/* Meter — 5 cols */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-[5px] p-8 flex flex-col items-center justify-center">
            <CompetitionMeter score={data.competitionScore} />
          </div>

          {/* Right column — 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-5">

            {/* Total Products */}
            <div className="bg-white border border-gray-200 rounded-[5px] p-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Products Containing This Keyword</p>
              <p className="text-7xl font-black text-slate-900 leading-none">{data.resultCount.toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-3">listings competing for this keyword</p>
            </div>

            {/* Quick Research Links */}
            <div className="bg-white border border-gray-200 rounded-[5px] p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Keyword Competition</p>
              <p className="text-sm font-semibold text-slate-700 mb-5">Quickly find the top ranking products</p>
              <div className="space-y-2">
                {data.competitionLinks?.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-[5px] border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                          {item.title || 'View on TpT →'}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-purple-500 flex-shrink-0 ml-3" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* View on TpT */}
        <div className="bg-white border border-gray-200 rounded-[5px] px-8 py-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">Research all <span className="font-bold text-slate-800">{data.resultCount.toLocaleString()}</span> products ranking for this keyword on TpT</p>
          <a
            href={`https://www.teacherspayteachers.com/browse?search=${encodeURIComponent(data.keyword)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-[5px] transition"
          >
            View on TpT <ExternalLink size={14} />
          </a>
        </div>

        {/* Matching Keywords Table */}
        {data.matchingKeywords && data.matchingKeywords.length > 0 && (
          <div className="mt-5">
            <h2 className="text-xl font-black text-slate-900 mb-3">Matching Keywords</h2>
            <div className="overflow-x-auto rounded-[5px] border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Keyword</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Competition Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Opportunity Grade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Results</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matchingKeywords.map((row, idx) => {
                    const g = getGrade(row.competitionScore)
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-purple-50 transition">
                        <td className="px-4 py-3">
                          <Link href={`/keywords/${encodeURIComponent(row.keyword)}`}
                            className="font-medium text-purple-600 hover:text-purple-800 hover:underline">
                            {row.keyword}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">{row.competitionScore.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-sm ${g.color}`}>{g.label}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{row.resultCount.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
