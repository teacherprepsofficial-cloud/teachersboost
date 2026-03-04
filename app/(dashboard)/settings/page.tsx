'use client'

import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Account Section */}
        <div className="bg-white rounded-[15px] shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={session?.user?.name || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Plan
              </label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {session?.user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        {session?.user?.plan === 'free' && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-[15px] p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade to Pro</h2>
            <p className="text-gray-700 mb-6">
              Get unlimited keyword searches, shop analysis, and AI generators.
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
              Upgrade Now - $9.99/month
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
