'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useSession } from 'next-auth/react'

export function FeedbackWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'suggestion' | 'bug' | 'other'>('suggestion')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !message.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
          setMessage('')
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:block fixed bottom-6 right-6 bg-rose-600 text-white p-4 rounded-full shadow-lg hover:bg-rose-700 transition z-40"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white rounded-[5px] shadow-2xl border border-gray-300 p-6 w-80 z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Send Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {submitted ? (
            <p className="text-center text-green-600 font-semibold">
              Thank you for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-24"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="w-full bg-rose-600 text-white py-2 rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
