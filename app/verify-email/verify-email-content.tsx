'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const success = searchParams.get('success')
  const error = searchParams.get('error')
  const token = searchParams.get('token')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (token && !success && !error) {
      setVerifying(true)
      router.push(`/api/auth/verify-email?token=${token}`)
    }
  }, [token, success, error])

  if (success) {
    return (
      <div className="bg-white rounded-[5px] shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your account is verified. Log in to set up your profile and start finding keyword opportunities.</p>
        <Link href="/login?next=/onboarding" className="block w-full bg-purple-600 text-white py-3 rounded-[5px] font-semibold hover:bg-purple-700 transition">
          Log In to TeachersBoost
        </Link>
      </div>
    )
  }

  if (error) {
    const message = error === 'invalid'
      ? 'This verification link has expired or is invalid.'
      : error === 'missing'
      ? 'No verification token found.'
      : 'Something went wrong. Please try again.'

    return (
      <div className="bg-white rounded-[5px] shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link href="/signup" className="block w-full bg-purple-600 text-white py-3 rounded-[5px] font-semibold hover:bg-purple-700 transition">
          Sign Up Again
        </Link>
      </div>
    )
  }

  // Default: just signed up, waiting for email
  return (
    <div className="bg-white rounded-[5px] shadow-lg p-8 max-w-md w-full text-center">
      <div className="text-5xl mb-4">📬</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
      <p className="text-gray-600 mb-2">We sent a confirmation link to your email address.</p>
      <p className="text-gray-400 text-sm mb-6">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
      <Link href="/login" className="text-purple-600 text-sm font-semibold hover:underline">
        Already verified? Log in →
      </Link>
    </div>
  )
}
