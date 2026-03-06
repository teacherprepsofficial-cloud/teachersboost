'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Store, ExternalLink, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_CONFIG = {
  pass:    { icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-50  border-green-200',  label: 'Good' },
  warning: { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50  border-amber-200',  label: 'Needs Work' },
  fail:    { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50    border-red-200',     label: 'Missing' },
}

const PRIORITY_COLORS = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low:    'bg-gray-100 text-gray-600 border-gray-200',
}

const GRADE_CONFIG: Record<string, { color: string; bg: string }> = {
  A: { color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  B: { color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  C: { color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
  D: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  F: { color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

const LOADING_MESSAGES = [
  'Loading store page...',
  'Analyzing store profile...',
  'Reviewing product titles...',
  'Checking pricing strategy...',
  'Running AI analysis...',
]

export default function ShopAuditPage() {
  const { data: session } = useSession()
  const [storeUrl, setStoreUrl] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(0)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const plan = session?.user?.plan || 'free'
  const isPaid = plan === 'starter' || plan === 'pro' || plan === 'admin'

  const toggleExpand = (idx: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const audit = async () => {
    if (!storeUrl.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setLoadMsg(0)

    const interval = setInterval(() => setLoadMsg(m => Math.min(m + 1, LOADING_MESSAGES.length - 1)), 3000)

    const res = await fetch('/api/tools/shop-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl }),
    })
    clearInterval(interval)
    const d = await res.json()

    if (!res.ok) setError(d.error || 'Something went wrong')
    else setResult(d)
    setLoading(false)
  }

  const passCount  = result?.audit?.checks?.filter((c: any) => c.status === 'pass').length || 0
  const warnCount  = result?.audit?.checks?.filter((c: any) => c.status === 'warning').length || 0
  const failCount  = result?.audit?.checks?.filter((c: any) => c.status === 'fail').length || 0
  const gradeConf  = GRADE_CONFIG[result?.audit?.overallGrade] || GRADE_CONFIG['C']

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="bg-[#0f172a] px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white text-3xl font-black tracking-tight">Shop Audit</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered analysis of any TpT store — profile, products, pricing, and more</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">

        {!isPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-[5px] px-5 py-4 text-sm text-amber-800 font-medium">
            Shop Audit is available on Starter and Pro plans. <a href="/settings" className="underline font-bold">Upgrade your plan →</a>
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-[5px] shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">TpT Store URL or Store Name <span className="text-red-500">*</span></label>
            <input
              value={storeUrl}
              onChange={e => setStoreUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isPaid && audit()}
              placeholder="e.g. teacherspayteachers.com/Store/MrsSmith  or  MrsSmith"
              className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              disabled={!isPaid}
            />
            <p className="text-xs text-slate-400 mt-1.5">Works with any public TpT store — your own or others</p>
          </div>

          <button
            onClick={audit}
            disabled={loading || !storeUrl.trim() || !isPaid}
            className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Store size={16} />
            {loading ? LOADING_MESSAGES[loadMsg] : 'Audit This Store'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[5px] px-4 py-3 text-sm text-red-700 font-medium">
              {error}
              {error.includes('Upgrade') && <> <a href="/settings" className="underline font-bold ml-1">Upgrade now →</a></>}
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-[5px] shadow-sm overflow-hidden animate-pulse">
            <div className="bg-[#0f172a] px-5 py-4">
              <div className="h-4 w-40 bg-white/10 rounded" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-gray-100 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">

            {/* Score header */}
            <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
              <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-lg">{result.storeName || 'Store Audit'}</h2>
                  <a href={result.storeUrl} target="_blank" rel="noopener noreferrer"
                    className="text-slate-400 text-xs hover:text-slate-200 flex items-center gap-1 mt-0.5">
                    {result.storeUrl} <ExternalLink size={11} />
                  </a>
                </div>
                <div className={`text-center px-5 py-2 rounded-[5px] border ${gradeConf.bg}`}>
                  <p className={`text-4xl font-black ${gradeConf.color}`}>{result.audit.overallGrade}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{result.audit.overallScore}/100</p>
                </div>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="px-5 py-3 text-center">
                  <p className="text-xl font-black text-green-600">{passCount}</p>
                  <p className="text-xs text-slate-400">Passing</p>
                </div>
                <div className="px-5 py-3 text-center">
                  <p className="text-xl font-black text-amber-500">{warnCount}</p>
                  <p className="text-xs text-slate-400">Needs Work</p>
                </div>
                <div className="px-5 py-3 text-center">
                  <p className="text-xl font-black text-red-500">{failCount}</p>
                  <p className="text-xs text-slate-400">Failing</p>
                </div>
              </div>

              {/* Summary */}
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">{result.audit.summary}</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">Audit Checklist</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {result.audit.checks?.map((check: any, idx: number) => {
                  const conf = STATUS_CONFIG[check.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.warning
                  const Icon = conf.icon
                  const isOpen = expanded.has(idx)
                  return (
                    <div key={idx} className={`border-l-4 ${check.status === 'pass' ? 'border-green-400' : check.status === 'warning' ? 'border-amber-400' : 'border-red-400'}`}>
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F1F5F9] transition text-left"
                      >
                        <Icon size={18} className={`shrink-0 ${conf.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-800">{check.title}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-[5px] border capitalize ${PRIORITY_COLORS[check.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.low}`}>
                              {check.priority} priority
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{check.category}</p>
                        </div>
                        <span className={`shrink-0 text-xs font-bold ${conf.color}`}>{conf.label}</span>
                        {isOpen ? <ChevronUp size={15} className="shrink-0 text-slate-400" /> : <ChevronDown size={15} className="shrink-0 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className={`mx-5 mb-3 px-4 py-3 rounded-[5px] border text-sm text-gray-700 leading-relaxed ${conf.bg}`}>
                          {check.detail}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Product list */}
            {result.products?.length > 0 && (
              <div className="bg-white rounded-[5px] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-gray-900">Products Found ({result.products.length})</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.products.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 px-5 py-3">
                      <span className="text-xs text-slate-300 font-mono w-5 shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                        {p.rating > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">{'★'.repeat(Math.round(p.rating))} {p.rating.toFixed(1)} ({p.ratingCount} reviews)</p>
                        )}
                      </div>
                      {p.price > 0 && <span className="shrink-0 text-sm font-bold text-gray-700">${p.price.toFixed(2)}</span>}
                      {p.url && p.url !== result.storeUrl && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 text-slate-300 hover:text-rose-500 transition">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
