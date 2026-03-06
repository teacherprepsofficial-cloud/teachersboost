'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const TIMEZONES = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Alaska Time (AKT)', value: 'America/Anchorage' },
  { label: 'Hawaii Time (HST)', value: 'Pacific/Honolulu' },
  { label: 'Atlantic Time (AT)', value: 'America/Halifax' },
  { label: 'Newfoundland Time', value: 'America/St_Johns' },
  { label: 'London / GMT', value: 'Europe/London' },
  { label: 'Paris / CET', value: 'Europe/Paris' },
  { label: 'Dubai / GST', value: 'Asia/Dubai' },
  { label: 'India / IST', value: 'Asia/Kolkata' },
  { label: 'Singapore / SGT', value: 'Asia/Singapore' },
  { label: 'Tokyo / JST', value: 'Asia/Tokyo' },
  { label: 'Sydney / AEDT', value: 'Australia/Sydney' },
  { label: 'Auckland / NZDT', value: 'Pacific/Auckland' },
  { label: 'São Paulo / BRT', value: 'America/Sao_Paulo' },
  { label: 'Mexico City / CST', value: 'America/Mexico_City' },
  { label: 'Buenos Aires / ART', value: 'America/Argentina/Buenos_Aires' },
  { label: 'UTC', value: 'UTC' },
]

function planLabel(plan: string | undefined) {
  if (plan === 'admin') return 'Admin'
  if (plan === 'pro') return 'Pro Plan — $14.99/month'
  if (plan === 'starter') return 'Boost Plan — $9.99/month'
  return 'Starter — Free'
}

function planBadgeColor(plan: string | undefined) {
  if (plan === 'admin') return 'bg-rose-100 text-purple-800 border-rose-200'
  if (plan === 'pro') return 'bg-blue-100 text-blue-800 border-blue-200'
  if (plan === 'starter') return 'bg-green-100 text-green-800 border-green-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

function SettingsInner() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgraded') === '1'

  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [renewalDate, setRenewalDate] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [usage, setUsage] = useState<any>(null)

  useEffect(() => {
    fetch('/api/user/usage').then(r => r.ok ? r.json() : null).then(d => d && setUsage(d)).catch(() => {})
  }, [])

  // Init from session once loaded
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setTimezone((session.user as any).timezone || 'America/New_York')
      const rd = (session.user as any).subscriptionRenewalDate
      if (rd) setRenewalDate(new Date(rd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
    }
  }, [session?.user?.email])

  const plan = session?.user?.plan
  const isPaidPlan = plan === 'starter' || plan === 'pro'

  async function handleCheckout(planName: string) {
    setUpgrading(planName)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Could not start checkout. Please try again.')
        setUpgrading(null)
      }
    } catch {
      setError('Could not connect to checkout. Please try again.')
      setUpgrading(null)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, timezone }),
      })
      if (!res.ok) throw new Error('Save failed')
      await update({ name, timezone })
      setSaved(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      if (!res.ok) throw new Error('Cancel failed')
      await update({ plan: 'free' })
      setShowCancelConfirm(false)
      router.refresh()
    } catch {
      setError('Failed to cancel. Please contact support.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6">
      <div className="max-w-4xl mx-auto">
        {justUpgraded && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-[5px] px-5 py-4 text-green-800 font-semibold text-sm">
            🎉 Your plan has been upgraded! Welcome to TeachersBoost Pro.
          </div>
        )}
        {/* Account + Plan Section */}
        <div className="bg-white rounded-[5px] shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-[5px] bg-[#F1F5F9] text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-[5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Plan status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subscription</label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-[5px] border font-semibold text-sm ${planBadgeColor(plan)}`}>
                {planLabel(plan)}
              </div>
              {renewalDate && isPaidPlan && (
                <p className="text-xs text-gray-500 mt-1.5">Renews on {renewalDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Usage Section */}
        <div className="bg-white rounded-[5px] shadow p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Usage This Period</h2>
              <p className="text-sm text-gray-500 mt-1">Resets weekly for searches, monthly for AI tools.</p>
            </div>
            {plan === 'free' && (
              <a href="/pricing" className="text-sm font-semibold text-rose-600 hover:underline">Upgrade for more →</a>
            )}
          </div>

          {!usage ? (
            <div className="space-y-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { key: 'keywordSearches', label: 'Keyword Searches', period: 'week', proLimit: 'Unlimited', starterLimit: 'Unlimited', freeLimit: 3 },
                { key: 'nicheFinder',     label: 'Niche Finder',      period: 'month', proLimit: 'Unlimited', starterLimit: 'Unlimited', freeLimit: 3 },
                { key: 'titleGenerator',  label: 'Title Generator',   period: 'month', proLimit: 75, starterLimit: 20, freeLimit: 0 },
                { key: 'descWriter',      label: 'Description Writer',period: 'month', proLimit: 75, starterLimit: 20, freeLimit: 0 },
              ].map(({ key, label, period, proLimit, starterLimit, freeLimit }) => {
                const stat = usage[key]
                if (!stat) return null
                const used: number = stat.used
                const limit: number = stat.limit
                const isUnlimited = limit === null || limit === Infinity || !isFinite(limit)
                const planLimit = isUnlimited ? null : limit
                const proLimitNum = typeof proLimit === 'number' ? proLimit : null
                // Bar: full width = proLimit if numeric, else just show usage
                const barMax = proLimitNum ?? (planLimit ?? 10)
                const usedPct = barMax > 0 ? Math.min((used / barMax) * 100, 100) : 0
                const planPct = planLimit && barMax > 0 ? Math.min((planLimit / barMax) * 100, 100) : 100
                const resetsAt = new Date(stat.resetsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                      <span className="text-xs text-gray-400">
                        {isUnlimited
                          ? <span className="text-green-600 font-semibold">Unlimited</span>
                          : planLimit === 0
                          ? <span className="text-gray-400">Not on your plan</span>
                          : <span className="font-semibold text-gray-700">{used} / {planLimit} <span className="font-normal text-gray-400">this {period}</span></span>
                        }
                      </span>
                    </div>
                    <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      {/* Pro tier ghost bar (grayed out) */}
                      {!isUnlimited && proLimitNum && planLimit !== proLimitNum && (
                        <div
                          className="absolute top-0 left-0 h-full bg-gray-200 rounded-full"
                          style={{ width: `${planPct}%` }}
                        />
                      )}
                      {/* Actual usage bar */}
                      {!isUnlimited && barMax > 0 && (
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                            planLimit === 0 ? 'bg-gray-300' :
                            used >= (planLimit ?? Infinity) ? 'bg-rose-500' : 'bg-rose-600'
                          }`}
                          style={{ width: `${usedPct}%` }}
                        />
                      )}
                      {isUnlimited && (
                        <div className="absolute top-0 left-0 h-full w-full bg-green-200 rounded-full" />
                      )}
                    </div>
                    {!isUnlimited && planLimit !== null && planLimit > 0 && plan !== 'pro' && plan !== 'admin' && (
                      <p className="text-xs text-gray-400 mt-1">
                        Pro plan: <span className="text-gray-500 font-medium">{typeof proLimit === 'number' ? `${proLimit}/month` : proLimit}</span>
                        {' · '}Resets {resetsAt}
                      </p>
                    )}
                    {!isUnlimited && planLimit !== null && planLimit > 0 && (plan === 'pro' || plan === 'admin') && (
                      <p className="text-xs text-gray-400 mt-1">Resets {resetsAt}</p>
                    )}
                    {planLimit === 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Available on Starter & Pro · <a href="/pricing" className="text-rose-600 font-semibold hover:underline">Upgrade →</a>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Dashboard Preferences */}
        <div className="bg-white rounded-[5px] shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Preferences</h2>
          <p className="text-gray-600 text-sm mb-6">Personalize your daily keyword opportunities feed.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-[5px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Used to show the correct date on your dashboard.</p>
            </div>

          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-rose-600 text-white px-6 py-2.5 rounded-[5px] font-semibold hover:bg-rose-700 transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-green-600 font-semibold text-sm">✓ Saved</span>}
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </div>

        {/* Upgrade CTA — free users only */}
        {plan === 'free' && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-[5px] p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>
            <p className="text-gray-700 mb-6">Get unlimited keyword searches, shop analysis, and AI generators.</p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleCheckout('starter')}
                disabled={upgrading !== null}
                className="bg-rose-600 text-white px-6 py-3 rounded-[5px] font-semibold hover:bg-rose-700 transition disabled:opacity-60"
              >
                {upgrading === 'starter' ? 'Redirecting...' : 'Starter Plan — $9.99/month'}
              </button>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={upgrading !== null}
                className="bg-gray-900 text-white px-6 py-3 rounded-[5px] font-semibold hover:bg-gray-800 transition disabled:opacity-60"
              >
                {upgrading === 'pro' ? 'Redirecting...' : 'Pro Plan — $14.99/month'}
              </button>
            </div>
          </div>
        )}

        {/* Cancel subscription — paid users only */}
        {isPaidPlan && (
          <div className="bg-white rounded-[5px] shadow p-8 border border-red-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription</h2>
            <p className="text-gray-600 text-sm mb-5">
              You will be downgraded to the free Starter plan immediately. This cannot be undone.
            </p>

            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="bg-red-600 text-white px-6 py-2.5 rounded-[5px] font-semibold hover:bg-red-700 transition"
              >
                Cancel My Subscription
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm font-semibold text-red-700 w-full mb-1">Are you sure? This will end your subscription now.</p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-[5px] font-semibold hover:bg-red-700 transition disabled:opacity-60"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel My Subscription'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-6 py-2.5 rounded-[5px] border border-gray-300 font-semibold text-gray-700 hover:bg-[#F1F5F9] transition"
                >
                  Keep My Plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  )
}
