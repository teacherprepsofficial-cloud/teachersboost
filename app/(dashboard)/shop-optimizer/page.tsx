'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Store, Loader } from 'lucide-react'

export default function ShopOptimizerPage() {
  const { data: session } = useSession()
  const [shopUrl, setShopUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopUrl.trim() || !session?.user?.id) return

    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement shop scraping
      console.log('Scraping shop:', shopUrl)
    } catch (err) {
      setError('Failed to analyze shop')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Optimizer</h1>
        <p className="text-gray-600 mb-8">
          Analyze your TpT shop and get personalized recommendations
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-[5px] shadow p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              TpT Shop URL
            </label>
            <input
              type="url"
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              placeholder="https://www.teacherspayteachers.com/store/your-store-name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !shopUrl.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {isLoading ? <Loader className="animate-spin" size={20} /> : <Store size={20} />}
            {isLoading ? 'Analyzing...' : 'Analyze Shop'}
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-[5px] p-6">
          <p className="text-blue-900">
            Coming soon: Shop analysis, competitor benchmarking, and AI recommendations
          </p>
        </div>
      </div>
    </div>
  )
}
