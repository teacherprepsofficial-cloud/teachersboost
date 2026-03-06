'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Telescope, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SignupPromptModal } from '@/components/SignupPromptModal'

const EXAMPLE_ROLES = [
  '3rd grade teacher',
  'High school science teacher',
  'Special education resource room',
  'Kindergarten teacher',
  'Middle school math teacher',
  'School librarian',
  'ESL / ELL teacher',
  'High school English teacher',
]

interface NicheResult {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
}

function getGrade(score: number) {
  if (score <= 1)  return { label: '🚀 Excellent', bar: 'bg-[#00e676]', text: 'text-green-600', pct: 4 }
  if (score <= 25) return { label: '🟢 Easy',      bar: 'bg-green-500', text: 'text-green-600', pct: Math.round((score / 100) * 100) }
  if (score <= 50) return { label: '🟠 Medium',    bar: 'bg-orange-400', text: 'text-orange-500', pct: Math.round((score / 100) * 100) }
  if (score <= 75) return { label: '🔴 Hard',      bar: 'bg-red-500',   text: 'text-red-500',   pct: Math.round((score / 100) * 100) }
  return                  { label: '⚫ Very Hard',  bar: 'bg-slate-800', text: 'text-slate-700', pct: Math.round((score / 100) * 100) }
}

const LOADING_MESSAGES = [
  'Analyzing your niche...',
  'Generating keyword ideas for your role...',
  'Scanning TpT competition data...',
  'Scoring opportunities...',
  'Almost there — ranking results...',
]

export default function NicheFinderPage() {
  const { data: session } = useSession()
  const [role, setRole] = useState('')
  const [niches, setNiches] = useState<NicheResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(0)
  const [error, setError] = useState('')
  const [meta, setMeta] = useState<{ role: string; used: number; remaining: number | null } | null>(null)

  const [showSignupModal, setShowSignupModal] = useState(false)
  const plan = session?.user?.plan || 'free'
  const isPaid = plan === 'starter' || plan === 'pro' || plan === 'admin'

  const find = async () => {
    if (!role.trim()) return
    if (!session) { setShowSignupModal(true); return }
    setLoading(true)
    setError('')
    setNiches([])
    setMeta(null)
    setLoadMsg(0)

    // Cycle loading messages
    const interval = setInterval(() => setLoadMsg(m => Math.min(m + 1, LOADING_MESSAGES.length - 1)), 3500)

    const res = await fetch('/api/tools/niche-finder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    clearInterval(interval)
    const d = await res.json()

    if (!res.ok) {
      setError(d.error || 'Something went wrong')
    } else {
      setNiches(d.niches)
      setMeta({ role: d.role, used: d.used, remaining: d.remaining })
    }
    setLoading(false)
  }

  return (
    <>
    <div className="min-h-screen bg-[#F1F5F9]">

      <div className="max-w-3xl mx-auto px-8 py-6 space-y-6">

        {/* Input card */}
        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              What do you teach? <span className="text-red-500">*</span>
            </label>
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && find()}
              placeholder="e.g. 3rd grade math teacher, special education resource room, high school biology..."
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {EXAMPLE_ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="text-xs text-slate-500 border border-gray-200 rounded-[5px] px-2.5 py-1 hover:border-rose-400 hover:text-rose-600 transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {!isPaid && meta && (
            <p className="text-xs text-slate-400">
              {meta.remaining !== null ? `${3 - (meta.remaining)} / 3 free searches used this month` : ''}
              {meta.remaining === 0 && <> — <a href="/settings" className="text-rose-600 font-semibold underline">Upgrade for unlimited →</a></>}
            </p>
          )}

          <button
            onClick={find}
            disabled={loading || !role.trim()}
            className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Telescope size={16} />
            {loading ? LOADING_MESSAGES[loadMsg] : 'Find My Best Niches'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[5px] px-4 py-3 text-sm text-red-700 font-medium">
              {error}
              {error.includes('Upgrade') && <> <a href="/settings" className="underline font-bold">Upgrade now →</a></>}
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-5 py-3">
              <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-4 w-48 bg-gray-100 rounded" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full" />
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {niches.length > 0 && meta && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm">
                  Top Opportunities for "{meta.role}"
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Sorted by lowest competition — click any keyword to research it</p>
              </div>
              {!isPaid && (
                <a href="/settings" className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
                  Unlock all 25 →
                </a>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {niches.map((niche, idx) => {
                const grade = getGrade(niche.competitionScore)
                return (
                  <Link
                    key={idx}
                    href={`/keywords/${encodeURIComponent(niche.keyword)}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-rose-50 transition group"
                  >
                    {/* Rank */}
                    <span className="text-2xl font-black text-gray-200 w-8 shrink-0 text-right leading-none select-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Keyword + bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-rose-700 truncate mb-1.5 capitalize">
                        {niche.keyword}
                      </p>
                      {/* Competition bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${grade.bar}`}
                          style={{ width: `${Math.max(grade.pct, 2)}%` }}
                        />
                      </div>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <p className={`text-xs font-bold ${grade.text}`}>{grade.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{niche.competitionScore.toFixed(1)} score</p>
                    </div>

                    {/* CTA */}
                    <ArrowRight size={15} className="shrink-0 text-gray-300 group-hover:text-rose-500 transition" />
                  </Link>
                )
              })}
            </div>

            {!isPaid && (
              <div className="px-5 py-4 bg-rose-50 border-t border-rose-100 flex items-center justify-between">
                <p className="text-sm text-rose-700 font-medium">
                  You're seeing 5 of 25 opportunities. Upgrade to unlock the full picture.
                </p>
                <a href="/settings" className="shrink-0 ml-4 bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-[5px] hover:bg-rose-700 transition">
                  Upgrade →
                </a>
              </div>
            )}

            {meta.remaining !== null && (
              <div className="px-5 py-3 bg-[#F1F5F9] border-t border-gray-100">
                <p className="text-xs text-slate-400">{meta.used} / 3 free searches used this month</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <SignupPromptModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  )
}
