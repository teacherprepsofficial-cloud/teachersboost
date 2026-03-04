'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Store, Type, FileText, DollarSign, Settings, LogOut, Menu, LayoutDashboard, Bookmark } from 'lucide-react'
import { useState } from 'react'
import { FeedbackWidget } from './FeedbackWidget'

const menuItems = [
  { href: '/dashboard',              label: 'Dashboard',             icon: LayoutDashboard },
  { href: '/keywords',               label: 'Keyword Research',      icon: Search },
  { href: '/shop-optimizer',         label: 'Shop Optimizer',        icon: Store },
  { href: '/title-generator',        label: 'Title Generator',       icon: Type },
  { href: '/description-generator',  label: 'Description Generator', icon: FileText },
  { href: '/pricing-calculator',     label: 'Pricing Calculator',    icon: DollarSign },
  { href: '/saved-keywords',         label: 'Saved Keywords',        icon: Bookmark },
  { href: '/settings',               label: 'Settings',              icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="text-xl font-black tracking-tight text-white">
          TeachersBoost
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-sm font-medium transition ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="px-3 py-2.5 bg-white/5 rounded-[5px]">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white rounded-[5px] transition"
        >
          <LogOut size={17} />
          Log Out
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex w-60 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-[5px]"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed left-0 top-0 h-full w-60 z-50 transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onNavigate={() => setIsOpen(false)} />
      </div>

      <FeedbackWidget />
    </>
  )
}
