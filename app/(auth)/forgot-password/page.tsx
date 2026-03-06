'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-8 max-w-md w-full">
      {sent ? (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-6">
            If an account exists for <span className="font-semibold text-gray-700">{email}</span>, we've sent a password reset link. It expires in 1 hour.
          </p>
          <Link href="/login" className="text-rose-600 font-semibold hover:underline text-sm">
            ← Back to log in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
          <p className="text-gray-500 text-sm mb-6">
            No worries — enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-rose-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
