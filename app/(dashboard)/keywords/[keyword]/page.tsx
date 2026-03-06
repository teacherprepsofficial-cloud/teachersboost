'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Loader, Bookmark, BookmarkCheck, Lock } from 'lucide-react'
import { InfoTooltip } from '@/components/InfoTooltip'
import { useSession } from 'next-auth/react'
import { SignupPromptModal } from '@/components/SignupPromptModal'

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

// KD 0–100 scale. competitionScore = resultCount/1000 (already 0–100 naturally for TpT)
// Bands: 0-1 Rocket | 2-25 Easy | 26-50 Medium | 51-75 Hard | 76-100 Very Hard
function getGrade(kd: number) {
  if (kd <= 1) return {
    label: '🚀 Excellent',
    sub: 'Rare find — jump on this keyword now',
    badge: 'border-0',
    badgeStyle: { background: '#00e676', color: '#003d1a', boxShadow: '0 0 12px #00e676, 0 0 24px #00e67655' },
    color: 'font-bold',
    colorStyle: { color: '#00a854' },
    arcColor: '#00e676',
  }
  if (kd <= 25) return {
    label: '🟢 Easy',
    sub: 'Low competition — great opportunity',
    badge: 'bg-green-100 text-green-800 border-green-200',
    badgeStyle: {},
    color: 'text-green-700 font-bold',
    colorStyle: {},
    arcColor: '#22c55e',
  }
  if (kd <= 50) return {
    label: '🟠 Medium',
    sub: 'Some competition — winnable with a strong product',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badgeStyle: {},
    color: 'text-yellow-700 font-semibold',
    colorStyle: {},
    arcColor: '#eab308',
  }
  if (kd <= 75) return {
    label: '🔴 Hard',
    sub: 'High competition — very difficult to rank',
    badge: 'bg-red-100 text-red-800 border-red-200',
    badgeStyle: {},
    color: 'text-red-600 font-semibold',
    colorStyle: {},
    arcColor: '#ef4444',
  }
  return {
    label: '⚫ Very Hard',
    sub: 'Saturated — extremely difficult to rank here',
    badge: 'bg-slate-900 text-white border-slate-900',
    badgeStyle: {},
    color: 'text-slate-700 font-semibold',
    colorStyle: {},
    arcColor: '#0f172a',
  }
}

const KD_SEGMENTS = [
  { start: 0,  end: 1,   color: '#00e676' }, // neon green — rocket/excellent
  { start: 1,  end: 25,  color: '#22c55e' }, // green — easy
  { start: 25, end: 50,  color: '#eab308' }, // yellow — medium
  { start: 50, end: 75,  color: '#ef4444' }, // red — hard
  { start: 75, end: 100, color: '#0f172a' }, // near-black — very hard
]

function KDMeter({ score }: { score: number }) {
  const kd = Math.min(Math.round(score), 100)
  const grade = getGrade(kd)

  const cx = 150, cy = 140, r = 108, sw = 26
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  const PL = 1000

  // kd=0 → needle far LEFT (angle=π), kd=100 → needle far RIGHT (angle=0)
  const angle = Math.PI * (1 - kd / 100)
  const needleTip = {
    x: (cx + (r - 3) * Math.cos(angle)).toFixed(1),
    y: (cy - (r - 3) * Math.sin(angle)).toFixed(1),
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-2xl font-black text-slate-900 tracking-tight mb-3 text-center w-full flex items-center justify-center">
        Keyword Difficulty
        <InfoTooltip text="A 0–100 score showing how hard it would be to rank for this keyword on TpT — the lower the score, the easier it is to get your product seen." />
      </p>
      <div className="relative w-full flex flex-col items-center">
        <svg width="300" height="158" viewBox="0 0 300 158">
          {/* Gray background track */}
          <path d={arcPath} fill="none" stroke="#e5e7eb" strokeWidth={sw} strokeLinecap="butt" pathLength={PL} />

          {/* Multi-colored segments — filled up to kd position */}
          {KD_SEGMENTS.map(seg => {
            if (kd <= seg.start) return null
            const filledEnd = Math.min(kd, seg.end)
            const len = (filledEnd - seg.start) * 10   // PL units
            const offset = seg.start * 10
            const gap = filledEnd < seg.end ? 0 : 6    // gap between fully-filled segments
            return (
              <path
                key={seg.start}
                d={arcPath}
                fill="none"
                stroke={seg.color}
                strokeWidth={sw}
                strokeLinecap="butt"
                pathLength={PL}
                strokeDasharray={`${len - gap} ${PL}`}
                strokeDashoffset={`-${offset}`}
              />
            )
          })}

          {/* EASY / HARD labels */}
          <text x="20" y={cy + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" fontFamily="system-ui,sans-serif">EASY</text>
          <text x="280" y={cy + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" fontFamily="system-ui,sans-serif">HARD</text>

          {/* Needle */}
          <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="8" fill="#0f172a" />
        </svg>

        {/* KD number */}
        <div className="mt-1 text-center">
          <p className="text-6xl font-black text-slate-900 leading-none">{kd}</p>
        </div>
      </div>

      <span
        className={`inline-block px-5 py-2 border rounded-[5px] text-base font-black mt-4 ${grade.badge} ${kd < 10 ? 'animate-pulse' : ''}`}
        style={grade.badgeStyle}
      >
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

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
          <Loader className="animate-spin mx-auto mb-5 text-rose-600" size={48} />
          <p className="text-slate-800 text-2xl font-bold">Analyzing <span className="text-rose-600">"{keyword}"</span></p>
          <p className="text-slate-400 text-sm mt-2">Pulling live data from TpT — takes 10–20 seconds</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-8">
        <Link href="/keywords" className="flex items-center gap-2 text-rose-600 mb-6 text-sm font-semibold">
          <ArrowLeft size={16} /> Back
        </Link>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <Link href="/keywords" className="flex items-center gap-2 text-slate-500 hover:text-rose-600 text-sm font-medium transition">
          <ArrowLeft size={15} /> Keyword Explorer
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
                  ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
                  : 'bg-white border-gray-200 text-slate-600 hover:border-rose-400 hover:text-rose-600'
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
            <KDMeter score={data.competitionScore} />
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
                    className="flex items-center justify-between px-4 py-3 rounded-[5px] border border-gray-100 hover:border-rose-300 hover:bg-rose-50 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-700 truncate">
                          {item.title || 'View on TpT →'}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-rose-500 flex-shrink-0 ml-3" />
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
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2.5 rounded-[5px] transition"
          >
            View on TpT <ExternalLink size={14} />
          </a>
        </div>

        {/* Matching Keywords Table */}
        {data.matchingKeywords && data.matchingKeywords.length > 0 && (() => {
          const plan = (session?.user as any)?.plan || 'free'
          const isPaid = plan !== 'free'
          const FREE_LIMIT = 3
          const visibleRows = isPaid ? data.matchingKeywords : data.matchingKeywords.slice(0, FREE_LIMIT)
          const lockedCount = isPaid ? 0 : data.matchingKeywords.length - FREE_LIMIT

          return (
            <div className="mt-5">
              <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center">
                Matching Keywords
                <InfoTooltip text="Related keyword variations of your search — each one is a potential product idea you could create and sell on TpT." />
              </h2>
              <div className="overflow-x-auto rounded-[5px] border border-gray-200">
                <table className="w-full">
                  <thead className="bg-[#F1F5F9] border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Keyword</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Keyword Difficulty</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Competition Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, idx) => {
                      const g = getGrade(row.competitionScore)
                      return (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-rose-50 transition">
                          <td className="px-4 py-3">
                            {isPaid ? (
                              <Link href={`/keywords/${encodeURIComponent(row.keyword)}`}
                                className="font-medium text-gray-900 hover:text-rose-600 hover:underline">
                                {row.keyword}
                              </Link>
                            ) : (
                              <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="font-medium text-gray-900 hover:text-rose-600 flex items-center gap-1.5 group"
                              >
                                {row.keyword}
                                <Lock size={11} className="text-gray-300 group-hover:text-rose-400" />
                              </button>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-sm font-semibold ${g.color}`} style={g.colorStyle}>{g.label}</td>
                          <td className="px-4 py-3 text-sm font-black text-gray-800">{Math.min(Math.round(row.competitionScore), 100)}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{row.resultCount.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Upgrade prompt for free users */}
              {lockedCount > 0 && (
                <div className="relative mt-0 border border-t-0 border-gray-200 rounded-b-[5px] overflow-hidden">
                  {/* Blurred preview rows */}
                  <div className="blur-sm pointer-events-none select-none">
                    {data.matchingKeywords.slice(FREE_LIMIT, FREE_LIMIT + 3).map((row, idx) => {
                      const g = getGrade(row.competitionScore)
                      return (
                        <div key={idx} className="flex gap-4 px-4 py-3 border-b border-gray-100 bg-white">
                          <span className="flex-1 font-medium text-gray-900">{row.keyword}</span>
                          <span className={`text-sm font-semibold ${g.color}`}>{g.label}</span>
                          <span className="text-sm font-black text-gray-800 w-16 text-center">{Math.min(Math.round(row.competitionScore), 100)}</span>
                          <span className="text-sm text-slate-500 w-20 text-right">{row.resultCount.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                    <p className="text-slate-800 font-bold text-base mb-1">
                      🔒 {lockedCount} more keyword{lockedCount !== 1 ? 's' : ''} hidden
                    </p>
                    <p className="text-slate-500 text-sm mb-4">Upgrade to unlock all matching keywords</p>
                    <a
                      href="/pricing"
                      className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-6 py-2.5 rounded-[5px] transition"
                    >
                      Upgrade to Unlock
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

      </div>
    </div>
    <SignupPromptModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}
