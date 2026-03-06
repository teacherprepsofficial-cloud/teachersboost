'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Trash2, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react'

const TIMEZONES = [
  { label: 'Eastern Time (ET)',        value: 'America/New_York' },
  { label: 'Central Time (CT)',        value: 'America/Chicago' },
  { label: 'Mountain Time (MT)',       value: 'America/Denver' },
  { label: 'Pacific Time (PT)',        value: 'America/Los_Angeles' },
  { label: 'Alaska Time (AKT)',        value: 'America/Anchorage' },
  { label: 'Hawaii Time (HST)',        value: 'Pacific/Honolulu' },
  { label: 'Atlantic Time (AT)',       value: 'America/Halifax' },
  { label: 'Newfoundland Time',        value: 'America/St_Johns' },
  { label: 'London / GMT',            value: 'Europe/London' },
  { label: 'Paris / CET',             value: 'Europe/Paris' },
  { label: 'Dubai / GST',             value: 'Asia/Dubai' },
  { label: 'India / IST',             value: 'Asia/Kolkata' },
  { label: 'Singapore / SGT',         value: 'Asia/Singapore' },
  { label: 'Tokyo / JST',             value: 'Asia/Tokyo' },
  { label: 'Sydney / AEDT',           value: 'Australia/Sydney' },
  { label: 'Auckland / NZDT',         value: 'Pacific/Auckland' },
  { label: 'São Paulo / BRT',         value: 'America/Sao_Paulo' },
  { label: 'Mexico City / CST',       value: 'America/Mexico_City' },
  { label: 'Buenos Aires / ART',      value: 'America/Argentina/Buenos_Aires' },
  { label: 'UTC',                      value: 'UTC' },
]

function planLabel(plan: string | undefined) {
  if (plan === 'admin')   return 'Admin'
  if (plan === 'pro')     return 'Pro Plan — $14.99/month'
  if (plan === 'starter') return 'Boost Plan — $9.99/month'
  return 'Free Plan'
}

function planBadgeColor(plan: string | undefined) {
  if (plan === 'admin')   return 'bg-rose-100 text-purple-800 border-rose-200'
  if (plan === 'pro')     return 'bg-blue-100 text-blue-800 border-blue-200'
  if (plan === 'starter') return 'bg-green-100 text-green-800 border-green-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

function SettingsInner() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgraded') === '1'

  const [name, setName]         = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  // Usage data (includes cancelAtPeriodEnd, subscriptionRenewalDate, hasPassword)
  const [usage, setUsage] = useState<any>(null)

  // Upgrade / checkout
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [billing, setBilling]     = useState<'monthly' | 'annual'>('monthly')

  // Cancel / plan switch confirmations
  const [cancelling, setCancelling]               = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [pendingSwitch, setPendingSwitch]         = useState<string | null>(null) // 'pro' | 'starter'

  // Billing portal
  const [openingPortal, setOpeningPortal] = useState(false)

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [pwSaving, setPwSaving]     = useState(false)
  const [pwResult, setPwResult]     = useState<{ ok: boolean; msg: string } | null>(null)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/user/usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setTimezone((session.user as any).timezone || 'America/New_York')
    }
  }, [session?.user?.email])

  const plan = session?.user?.plan
  const isPaidPlan      = plan === 'starter' || plan === 'pro'
  const cancelAtPeriodEnd = usage?.cancelAtPeriodEnd ?? false
  const renewalDate     = usage?.subscriptionRenewalDate
    ? new Date(usage.subscriptionRenewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const hasPassword: boolean | null = usage ? (usage.hasPassword ?? false) : null

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
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

  // planKey is e.g. 'starter_monthly' or 'pro_annual'
  // checkout API expects { plan: 'starter', billing: 'monthly' }
  async function handleCheckout(planKey: string) {
    setUpgrading(planKey); setError('')
    const [planBase, billingCycle] = planKey.split('_') // 'starter', 'monthly'
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planBase, billing: billingCycle }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setError(data.error || 'Could not start checkout. Please try again.'); setUpgrading(null) }
    } catch {
      setError('Could not connect to checkout. Please try again.')
      setUpgrading(null)
    }
  }

  async function handleSwitchPlan(planKey: string) {
    setUpgrading(planKey); setError('')
    try {
      const res = await fetch('/api/stripe/switch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (res.ok) {
        const planBase = planKey.split('_')[0] // 'pro' or 'starter'
        await update({ plan: planBase })
        window.location.href = '/settings?upgraded=1'
      } else {
        setError(data.error || 'Could not switch plan. Please try again.')
        setUpgrading(null)
      }
    } catch {
      setError('Could not switch plan. Please try again.')
      setUpgrading(null)
    }
  }

  async function handleOpenPortal() {
    setOpeningPortal(true); setError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setError(data.error || 'Could not open billing portal.') }
    } catch {
      setError('Could not open billing portal.')
    } finally {
      setOpeningPortal(false)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      if (!res.ok) throw new Error('Cancel failed')
      setShowCancelConfirm(false)
      setUsage((u: any) => u ? { ...u, cancelAtPeriodEnd: true } : u)
    } catch {
      setError('Failed to cancel. Please contact support.')
    } finally {
      setCancelling(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwSaving(true); setPwResult(null)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwResult({ ok: true, msg: 'Password updated successfully.' })
        setCurrentPw(''); setNewPw('')
        setShowPasswordForm(false)
      } else {
        setPwResult({ ok: false, msg: data.error || 'Failed to update password.' })
      }
    } catch {
      setPwResult({ ok: false, msg: 'Failed to update password.' })
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await signOut({ callbackUrl: '/' })
    } catch {
      setError('Failed to delete account. Please contact support.')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6">
      <div className="max-w-2xl mx-auto">

        {justUpgraded && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-[5px] px-5 py-4 text-green-800 font-semibold text-sm flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Your plan has been upgraded! Welcome to TeachersBoost.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-[5px] px-5 py-4 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Profile ── */}
        <section className="bg-white rounded-[5px] border border-gray-200 p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-[5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-[5px] bg-[#F1F5F9] text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Timezone — used for date in top left corner</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-[5px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Used to show the correct date on your dashboard.</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-rose-600 text-white px-5 py-2.5 rounded-[5px] font-semibold hover:bg-rose-700 transition disabled:opacity-60 text-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-green-600 font-semibold text-sm flex items-center gap-1"><CheckCircle size={14} /> Saved</span>}
          </div>
        </section>

        {/* ── Subscription ── */}
        <section className="bg-white rounded-[5px] border border-gray-200 p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Subscription</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] border font-semibold text-sm ${planBadgeColor(plan)}`}>
                {planLabel(plan)}
              </div>
              {renewalDate && isPaidPlan && !cancelAtPeriodEnd && (
                <p className="text-xs text-gray-500 mt-1.5">Renews {renewalDate}</p>
              )}
              {cancelAtPeriodEnd && renewalDate && (
                <p className="text-xs text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Cancels {renewalDate} — access remains until then
                </p>
              )}
            </div>
            {isPaidPlan && (
              <button
                onClick={handleOpenPortal}
                disabled={openingPortal}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-[5px] hover:bg-[#F1F5F9] transition disabled:opacity-60"
              >
                <CreditCard size={14} />
                {openingPortal ? 'Opening...' : 'Manage Billing'}
              </button>
            )}
          </div>

          {/* Usage bars */}
          {!usage ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-3.5 bg-gray-100 rounded w-40 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5 mt-2">
              {[
                { key: 'keywordSearches', label: 'Keyword Searches', period: 'week',  proLimit: null,  starterLimit: null, freeLimit: 3 },
                { key: 'nicheFinder',     label: 'Niche Finder',     period: 'month', proLimit: null,  starterLimit: null, freeLimit: 3 },
                { key: 'titleGenerator',  label: 'Title Generator',  period: 'month', proLimit: 75,    starterLimit: 20,   freeLimit: 0 },
                { key: 'descWriter',      label: 'Description Writer', period: 'month', proLimit: 75,  starterLimit: 20,   freeLimit: 0 },
              ].map(({ key, label, period, proLimit, freeLimit }) => {
                const stat = usage[key]
                if (!stat) return null
                const used: number = stat.used
                const limit: number = stat.limit
                const isUnlimited = limit === null || limit === Infinity || !isFinite(limit)
                const barMax = proLimit ?? (isUnlimited ? null : limit ?? 10)
                const usedPct = barMax ? Math.min((used / barMax) * 100, 100) : 0
                const resetsAt = new Date(stat.resetsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                      <span className="text-xs text-gray-400">
                        {isUnlimited
                          ? <span className="text-green-600 font-semibold">Unlimited</span>
                          : limit === 0
                          ? <span className="text-gray-400">Not on your plan</span>
                          : <span className="font-semibold text-gray-700">{used} / {limit} <span className="font-normal text-gray-400">this {period}</span></span>
                        }
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      {isUnlimited
                        ? <div className="absolute inset-0 bg-green-200 rounded-full" />
                        : barMax && barMax > 0 && (
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                              limit === 0 ? 'bg-gray-300' :
                              used >= limit ? 'bg-rose-500' : 'bg-rose-600'
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        )
                      }
                    </div>
                    {limit === 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Available on Starter & Pro · <a href="/pricing" className="text-rose-600 font-semibold hover:underline">Upgrade →</a>
                      </p>
                    )}
                    {!isUnlimited && limit > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Resets {resetsAt}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Update Password ── */}
        <section className="bg-white rounded-[5px] border border-gray-200 p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Update Password</h2>

          {hasPassword === null ? (
            <div className="h-8 bg-gray-100 rounded animate-pulse w-40" />
          ) : !hasPassword ? (
            <div className="text-sm text-gray-500">
              You signed in with Google. Password management is handled by your Google account.
            </div>
          ) : (
            <div>
              {pwResult && (
                <div className={`mb-4 px-4 py-3 rounded-[5px] text-sm font-medium ${pwResult.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {pwResult.msg}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-[5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-200 rounded-[5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="bg-rose-600 text-white px-5 py-2.5 rounded-[5px] font-semibold hover:bg-rose-700 transition disabled:opacity-60 text-sm"
                >
                  {pwSaving ? 'Updating...' : 'Change now'}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* ── Change My Subscription ── */}
        {plan !== 'admin' && (
          <section className="bg-white rounded-[5px] border border-gray-200 p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Change My Subscription</h2>
            <p className="text-sm text-gray-500 mb-5">Your current plan is highlighted below.</p>

            {cancelAtPeriodEnd && renewalDate && (
              <div className="mb-5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-[5px] px-4 py-3">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 font-medium">
                  Your subscription is set to cancel on {renewalDate}. You'll keep full access until then.
                </p>
              </div>
            )}

            {/* Plan cards — current plan highlighted, no action buttons */}
            <div className="space-y-3 mb-5">
              {[
                { key: 'free',    label: 'Free Plan',  price: null,          desc: '3 keyword searches/week · No AI tools · No saves' },
                { key: 'starter', label: 'Boost Plan', price: '$9.99/month',  desc: 'Unlimited searches · 20 AI uses/month · 50 saves' },
                { key: 'pro',     label: 'Pro Plan',   price: '$14.99/month', desc: 'Unlimited searches · 75 AI uses/month · 100 saves' },
              ].map(({ key, label, price, desc }) => {
                const isCurrent = plan === key && !cancelAtPeriodEnd
                return (
                  <div key={key} className={`rounded-[5px] border p-4 flex items-center justify-between gap-4 ${isCurrent ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-white'}`}>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {label}{price && <span className="text-gray-400 font-normal"> — {price}</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1.5 rounded-[5px] shrink-0">Current Plan</span>
                    )}
                  </div>
                )
              })}
            </div>

            <a
              href="/pricing"
              className="inline-block bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-[5px] hover:bg-rose-700 transition"
            >
              Update My Plan
            </a>
          </section>
        )}

        {/* ── Danger Zone ── */}
        <section className="bg-white rounded-[5px] border border-red-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-5">Permanently delete your account and all saved data. This cannot be undone.</p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 border border-red-300 text-red-600 px-5 py-2.5 rounded-[5px] font-semibold hover:bg-red-50 transition text-sm"
            >
              <Trash2 size={14} />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4 max-w-sm">
              <p className="text-sm font-semibold text-red-700">
                Type <span className="font-mono bg-red-50 px-1 rounded">delete my account</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my account"
                className="w-full px-4 py-2 border border-red-200 rounded-[5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== 'delete my account'}
                  className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-[5px] font-semibold hover:bg-red-700 transition disabled:opacity-50 text-sm"
                >
                  <Trash2 size={14} />
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                  className="px-5 py-2.5 rounded-[5px] border border-gray-200 font-semibold text-gray-700 hover:bg-[#F1F5F9] transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

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
