import { Suspense } from 'react'
import { VerifyEmailContent } from './verify-email-content'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
