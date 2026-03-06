'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-gray-600 mb-4">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-rose-600 font-semibold hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-8 max-w-md w-full">
      {done ? (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password updated!</h1>
          <p className="text-gray-500 text-sm">Redirecting you to log in...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
          <p className="text-gray-500 text-sm mb-6">Choose something strong that you'll remember.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
