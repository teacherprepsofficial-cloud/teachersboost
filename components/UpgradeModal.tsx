'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  remaining: number
  limit: number
}

export function UpgradeModal({ isOpen, onClose, remaining, limit }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[15px] shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Daily Limit Reached</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          You've used all {limit} of your daily keyword searches. Upgrade to Pro for unlimited
          access.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-[15px] p-4 mb-6">
          <p className="text-sm text-purple-900">
            <strong>Pro Plan</strong> - $9.99/month
          </p>
          <ul className="text-sm text-purple-800 mt-2 space-y-1">
            <li>✓ Unlimited keyword searches</li>
            <li>✓ Unlimited shop analysis</li>
            <li>✓ Title & description generators</li>
            <li>✓ Pricing calculator</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-[15px] font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => (window.location.href = '/pricing')}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-[15px] font-semibold hover:bg-purple-700 transition"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )
}
