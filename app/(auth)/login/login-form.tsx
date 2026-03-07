'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(searchParams.get('error') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (!result?.ok) {
        setError('Invalid email or password')
        return
      }

      const session = await getSession()
      const next = searchParams.get('next')
      if (next) {
        router.push(next)
      } else if (!(session?.user as any)?.onboardingCompleted) {
        router.push('/onboarding')
      } else {
        router.push('/keywords')
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-gray-600 mb-6">Log in to your TeachersBoost account</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-rose-600 hover:underline font-medium">
              Forgot your password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-rose-600 text-white py-2 rounded-[5px] font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-rose-600 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
