'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const STAR_LABELS: Record<number, string> = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Great!',
}

const MAX_CHARS = 600

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <svg
              width="48" height="48" viewBox="0 0 24 24"
              fill={(hover || value) >= star ? '#FBBF24' : 'none'}
              stroke={(hover || value) >= star ? '#F59E0B' : '#D1D5DB'}
              strokeWidth="1.5"
              className="transition-all duration-100"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
      </div>
      <p className={`text-sm font-semibold h-5 transition-all ${(hover || value) ? 'text-amber-500' : 'text-transparent'}`}>
        {STAR_LABELS[hover || value] || ''}
      </p>
    </div>
  )
}

export default function TestimonialsPage() {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [testimonials, setTestimonials] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(d => setTestimonials(d.testimonials || []))
      .catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating'); return }
    if (!message.trim()) { setError('Please write a message'); return }

    setSubmitting(true)
    setError('')
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, message }),
    })
    const d = await res.json()
    if (!res.ok) setError(d.error || 'Something went wrong')
    else { setSubmitted(true); setRating(0); setMessage('') }
    setSubmitting(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-8">
        <div className="bg-white rounded-[5px] shadow-sm p-8 max-w-sm w-full text-center">
          <p className="text-3xl mb-3">🔒</p>
          <h2 className="text-lg font-black text-gray-900 mb-2">Sign in to leave a review</h2>
          <p className="text-sm text-slate-500 mb-5">You must be logged in to submit a testimonial.</p>
          <a href="/login" className="block w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-[5px] transition text-sm">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">

      <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

        {/* Submit form */}
        <div className="bg-white rounded-[5px] shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-5">Leave a Review</h2>

          {submitted ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">🎉</p>
              <p className="text-green-600 font-bold text-lg">Thank you for your feedback!</p>
              <p className="text-slate-400 text-sm mt-1">Your testimonial is under review and will be published shortly.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-rose-600 hover:underline font-medium">
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="flex flex-col items-center py-2">
                <p className="text-sm font-bold text-gray-700 mb-3">How would you rate TeachersBoost?</p>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Your Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Tell other TpT sellers how TeachersBoost has helped you..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
                <p className={`text-xs mt-1 text-right ${message.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
                  {message.length} / {MAX_CHARS}
                </p>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !rating || !message.trim()}
                className="w-full bg-rose-600 text-white py-2.5 rounded-[5px] font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {submitting ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </form>
          )}
        </div>

        {/* Published testimonials */}
        {testimonials.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-900">What Teachers Are Saying</h2>
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-[5px] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="18" height="18" viewBox="0 0 24 24"
                        fill={t.rating >= s ? '#FBBF24' : 'none'}
                        stroke={t.rating >= s ? '#F59E0B' : '#D1D5DB'}
                        strokeWidth="1.5">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{t.message}"</p>
                <p className="text-xs font-semibold text-slate-400 mt-2">— {t.userName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
