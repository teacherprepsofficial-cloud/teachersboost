'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to sign up')
        return
      }

      router.push('/verify-email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 w-full max-w-3xl flex overflow-hidden">

      {/* Left — CTA panel */}
      <div className="hidden md:flex flex-col justify-center bg-rose-600 text-white p-10 w-5/12 shrink-0">
        <p className="text-sm font-bold uppercase tracking-widest text-rose-200 mb-3">TeachersBoost</p>
        <h2 className="text-4xl font-black leading-tight mb-8">
          Teachers Pay Teachers Seller Tool
        </h2>
        <ul className="space-y-5 text-xl font-medium">
          <li className="flex items-center gap-3">
            <span>🔎 Find keywords</span>
          </li>
          <li className="flex items-center gap-3">
            <span>📈 Optimize listings</span>
          </li>
          <li className="flex items-center gap-3">
            <span>🚀 Boost TpT sales</span>
          </li>
        </ul>
      </div>

      {/* Right — form */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your free account</h1>
        <p className="text-gray-500 mb-6">
          Get the insights that help <span className="text-rose-600 font-semibold">boost</span> your TpT shop.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Create password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              minLength={8}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-[5px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Confirm password"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-rose-600 shrink-0"
            />
            <span className="text-sm text-gray-600">
              Send me weekly emails with free resources for TpT sellers.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 text-white py-2 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-rose-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
