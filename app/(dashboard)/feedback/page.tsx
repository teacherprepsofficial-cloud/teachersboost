'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function FeedbackPage() {
  const { data: session } = useSession()
  const [type, setType] = useState<'suggestion' | 'bug' | 'other'>('suggestion')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, page: '/feedback' }),
      })
      if (res.ok) {
        setSubmitted(true)
        setMessage('')
      } else {
        const d = await res.json()
        setError(d.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <MessageCircle size={24} className="text-rose-600" />
          <h1 className="text-2xl font-black text-gray-900">Send Feedback</h1>
        </div>

        {!session?.user ? (
          <div className="bg-white rounded-[5px] border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-4 text-sm">You need to be logged in to send feedback.</p>
            <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-[5px] transition text-sm">
              Log in
            </Link>
          </div>
        ) : submitted ? (
          <div className="bg-white rounded-[5px] border border-green-200 p-8 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-900 mb-1">Thank you!</p>
            <p className="text-sm text-gray-500 mb-6">Your feedback has been received. We read every submission.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-[5px] transition text-sm"
              >
                Send more feedback
              </button>
              <Link href="/keywords" className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition py-2">
                Back to Keyword Explorer
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[5px] border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <div className="flex gap-2">
                {(['suggestion', 'bug', 'other'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-[5px] text-sm font-semibold border transition capitalize ${
                      type === t
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-rose-400 hover:text-rose-600'
                    }`}
                  >
                    {t === 'suggestion' ? '💡 Suggestion' : t === 'bug' ? '🐛 Bug Report' : '💬 Other'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think, what you'd like to see, or what's not working..."
                rows={5}
                className="w-full border border-gray-200 rounded-[5px] px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-[5px] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle size={16} />
              {isLoading ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
