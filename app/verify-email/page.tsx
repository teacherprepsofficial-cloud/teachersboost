import { Suspense } from 'react'
import { VerifyEmailContent } from './verify-email-content'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center p-8">
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <VerifyEmailContent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
