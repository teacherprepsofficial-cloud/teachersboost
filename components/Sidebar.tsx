'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Store,
  Zap,
  DollarSign,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { FeedbackWidget } from './FeedbackWidget'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Zap },
  { href: '/dashboard/keywords', label: 'Keyword Research', icon: Search },
  { href: '/dashboard/shop-optimizer', label: 'Shop Optimizer', icon: Store },
  { href: '/dashboard/title-generator', label: 'Title Generator', icon: Zap },
  { href: '/dashboard/description-generator', label: 'Description Generator', icon: Zap },
  { href: '/dashboard/pricing-calculator', label: 'Pricing Calculator', icon: DollarSign },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="text-2xl font-bold">
            TeachersBoost
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="px-4 py-2 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold text-white truncate">{session?.user?.email}</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="text-2xl font-bold">
            TeachersBoost
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <FeedbackWidget />
    </>
  )
}
