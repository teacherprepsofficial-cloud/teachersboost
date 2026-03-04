'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface FeedbackItem {
  _id: string
  userId: string
  type: string
  message: string
  page: string
  createdAt: string
}

export default function AdminFeedbackPage() {
  const { data: session } = useSession()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchFeedback = async () => {
      try {
        const res = await fetch('/api/admin/feedback')
        if (res.ok) {
          const data = await res.json()
          setFeedback(data)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [session?.user?.id])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">User Feedback</h1>

        {isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : feedback.length === 0 ? (
          <p className="text-gray-600">No feedback yet</p>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      item.type === 'bug'
                        ? 'bg-red-100 text-red-700'
                        : item.type === 'suggestion'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{item.message}</p>
                <p className="text-sm text-gray-500">Page: {item.page}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
