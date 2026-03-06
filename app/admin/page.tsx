'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAILS = ['teachersboost@gmail.com', 'elliottzelinskas@gmail.com']

function planLabel(plan: string) {
  if (plan === 'admin') return 'Admin'
  if (plan === 'pro') return 'Pro'
  if (plan === 'starter') return 'Boost'
  return 'Starter'
}

function planBadge(plan: string) {
  if (plan === 'admin') return 'bg-purple-100 text-purple-800'
  if (plan === 'pro') return 'bg-blue-100 text-blue-800'
  if (plan === 'starter') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-600'
}

interface StatsData {
  dailyCount: number
  mtdCount: number
  lifetimeCount: number
  recentSignups: { _id: string; name: string; email: string; plan: string; createdAt: string }[]
  recentCancellations: { _id: string; name: string; email: string; cancelledAt: string }[]
}

interface FeedbackItem {
  _id: string
  userId: string
  type: string
  message: string
  page: string
  createdAt: string
}

interface InboundItem {
  _id: string
  _type: 'feedback' | 'testimonial'
  userId: string
  type?: string
  message: string
  page?: string
  rating?: number
  userName?: string
  status?: string
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [inbound, setInbound] = useState<InboundItem[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'signups' | 'cancellations' | 'inbound'>('overview')

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && !isAdmin) { router.push('/dashboard'); return }
  }, [status, isAdmin, router])

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
    fetch('/api/admin/feedback').then(r => r.json()).then(setFeedback)
    fetch('/api/admin/inbound').then(r => r.json()).then(d => setInbound(d.items || []))
  }, [isAdmin])

  if (!isAdmin) return null

  const updateTestimonial = async (id: string, status: string) => {
    await fetch('/api/admin/inbound', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setInbound(prev => prev.map(item => item._id === id ? { ...item, status } : item))
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'signups', label: `Signups (${stats?.recentSignups?.length ?? '…'})` },
    { key: 'cancellations', label: `Cancellations (${stats?.recentCancellations?.length ?? '…'})` },
    { key: 'inbound', label: `Inbound (${inbound.length})` },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-[5px] transition ${
                activeTab === tab.key
                  ? 'bg-white border border-b-white border-gray-200 text-purple-700 -mb-px'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-[5px] shadow p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Today</p>
                <p className="text-4xl font-black text-gray-900">{stats?.dailyCount ?? '…'}</p>
                <p className="text-sm text-gray-500 mt-1">new signups</p>
              </div>
              <div className="bg-white rounded-[5px] shadow p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Month to Date</p>
                <p className="text-4xl font-black text-gray-900">{stats?.mtdCount ?? '…'}</p>
                <p className="text-sm text-gray-500 mt-1">new signups</p>
              </div>
              <div className="bg-white rounded-[5px] shadow p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">All Time</p>
                <p className="text-4xl font-black text-gray-900">{stats?.lifetimeCount ?? '…'}</p>
                <p className="text-sm text-gray-500 mt-1">total users</p>
              </div>
            </div>

            {/* Recent activity preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-[5px] shadow p-6">
                <h2 className="font-bold text-gray-900 mb-4">Latest Signups</h2>
                {!stats ? <p className="text-sm text-gray-400">Loading…</p> : (
                  <div className="space-y-2">
                    {stats.recentSignups.slice(0, 5).map(u => (
                      <div key={u._id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planBadge(u.plan)}`}>{planLabel(u.plan)}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-[5px] shadow p-6">
                <h2 className="font-bold text-gray-900 mb-4">Latest Inbound</h2>
                {inbound.length === 0 ? <p className="text-sm text-gray-400">No inbound yet</p> : (
                  <div className="space-y-3">
                    {inbound.slice(0, 5).map(item => (
                      <div key={item._id} className={`border-l-2 pl-3 ${item._type === 'testimonial' ? 'border-amber-400' : 'border-blue-300'}`}>
                        <p className="text-sm text-gray-700">{item.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item._type === 'testimonial' ? `⭐ ${item.rating}★ testimonial` : `💬 ${item.type}`} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Signups */}
        {activeTab === 'signups' && (
          <div className="bg-white rounded-[5px] shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentSignups.map((u, i) => (
                  <tr key={u._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planBadge(u.plan)}`}>{planLabel(u.plan)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cancellations */}
        {activeTab === 'cancellations' && (
          <div className="bg-white rounded-[5px] shadow overflow-hidden">
            {stats?.recentCancellations.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No cancellations yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Cancelled At</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentCancellations.map((u, i) => (
                    <tr key={u._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.cancelledAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Inbound */}
        {activeTab === 'inbound' && (
          <div className="space-y-3">
            {inbound.length === 0 ? (
              <p className="text-sm text-gray-500">No inbound messages yet.</p>
            ) : inbound.map(item => (
              <div key={item._id} className={`bg-white rounded-[5px] shadow p-5 border-l-4 ${item._type === 'testimonial' ? 'border-amber-400' : 'border-blue-400'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-[5px] ${item._type === 'testimonial' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item._type === 'testimonial' ? '⭐ Testimonial' : `💬 ${item.type}`}
                    </span>
                    {item._type === 'testimonial' && item.rating && (
                      <span className="text-amber-500 text-sm font-bold">{'★'.repeat(item.rating)}</span>
                    )}
                    {item._type === 'testimonial' && item.status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-[5px] ${item.status === 'published' ? 'bg-green-100 text-green-700' : item.status === 'deleted' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                {item.userName && <p className="text-xs text-slate-400 mb-1 font-medium">— {item.userName}</p>}
                <p className="text-gray-800 text-sm leading-relaxed">{item.message}</p>
                {item.page && <p className="text-xs text-gray-400 mt-1">Page: {item.page}</p>}
                {item._type === 'testimonial' && (
                  <div className="flex gap-2 mt-3">
                    {item.status !== 'published' && (
                      <button
                        onClick={() => updateTestimonial(item._id, 'published')}
                        className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-[5px] hover:bg-green-700 transition"
                      >
                        ✓ Accept & Publish
                      </button>
                    )}
                    {item.status === 'published' && (
                      <button
                        onClick={() => updateTestimonial(item._id, 'pending')}
                        className="text-xs font-bold bg-gray-200 text-gray-700 px-3 py-1.5 rounded-[5px] hover:bg-gray-300 transition"
                      >
                        Unpublish
                      </button>
                    )}
                    {item.status !== 'deleted' && (
                      <button
                        onClick={() => updateTestimonial(item._id, 'deleted')}
                        className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-[5px] hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
