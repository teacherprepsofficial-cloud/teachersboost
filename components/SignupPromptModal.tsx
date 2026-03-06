'use client'

import Link from 'next/link'
import { X, Search } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SignupPromptModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[5px] shadow-xl max-w-md w-full p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X size={18} />
        </button>

        <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-[5px] mb-5">
          <Search size={22} className="text-rose-600" />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-2">See your keyword results free</h2>
        <p className="text-sm text-gray-500 mb-6">
          Create a free account to unlock keyword competition scores, difficulty ratings, and related keyword variations for any TpT search.
        </p>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-[5px] transition"
          >
            Sign up free — no credit card required
          </Link>
          <Link
            href="/login"
            className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-[5px] hover:bg-gray-50 transition"
          >
            Log in to my account
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Free plan includes 3 keyword searches per week.
        </p>
      </div>
    </div>
  )
}
