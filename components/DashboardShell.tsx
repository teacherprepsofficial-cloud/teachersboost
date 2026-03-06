'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileBottomNav } from './MobileBottomNav'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMobileMenuOpen = useCallback((setter: (v: boolean) => void) => {
    // no-op: we manage state here
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9]">
      <TopBar onMobileMenuToggle={() => setMobileOpen(v => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <SidebarWithControl isOpen={mobileOpen} setIsOpen={setMobileOpen} />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

function SidebarWithControl({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}) {
  return <SidebarControlled isOpen={isOpen} setIsOpen={setIsOpen} />
}

// Import inline to avoid circular — we inline the controlled sidebar here
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search, LogOut, Bookmark, ShieldCheck, Wand2, FileText,
  Telescope, Star, Shield, ScrollText, HelpCircle, DollarSign, Phone, Info, User, MessageCircle
} from 'lucide-react'
import { useEffect } from 'react'
import { FeedbackWidget } from './FeedbackWidget'

const menuItems = [
  { href: '/keywords',              label: 'Keyword Explorer',   icon: Search },
  { href: '/niche-finder',          label: 'Niche Finder',        icon: Telescope },
  { href: '/title-generator',       label: 'Title Generator',     icon: Wand2 },
  { href: '/description-generator', label: 'Description Writer',  icon: FileText },
  { href: '/saved-keywords',        label: 'Keyword Notebook',    icon: Bookmark },
  { href: '/testimonials',          label: 'Testimonials',        icon: Star },
  { href: '/feedback',              label: 'Send Feedback',       icon: MessageCircle, mobileOnly: true },
]

const footerLinks = [
  { href: '/faq',     label: 'FAQ',     icon: HelpCircle },
  { href: '/privacy', label: 'Privacy', icon: Shield },
  { href: '/terms',   label: 'Terms',   icon: ScrollText },
]

const mobileNavLinks = [
  { href: '/pricing',  label: 'Pricing',    icon: DollarSign },
  { href: '/contact',  label: 'Contact',    icon: Phone },
  { href: '/about',    label: 'About',      icon: Info },
  { href: '/settings', label: 'My Account', icon: User },
]

const ADMIN_EMAILS = ['teachersboost@gmail.com', 'elliottzelinskas@gmail.com']

function LiveDate() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  const label = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  return (
    <div className="px-5 py-2.5 border-b border-gray-100 text-center">
      <p className="font-mono text-[10px] tracking-wide text-gray-400">{label}</p>
    </div>
  )
}

function SidebarContent({ onNavigate, isMobile = false }: { onNavigate?: () => void; isMobile?: boolean }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-gray-200 text-gray-800">
      <LiveDate />
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-sm font-semibold transition ${
              pathname === '/admin' ? 'bg-rose-600 text-white' : 'text-gray-700 hover:bg-rose-50 hover:text-gray-900'
            }`}
          >
            <ShieldCheck size={16} />
            Admin
          </Link>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/trending' && item.href !== '/keywords' && pathname.startsWith(item.href))
          if (item.mobileOnly && !isMobile) return null
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-sm font-medium transition ${
                isActive ? 'bg-rose-50 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-rose-600' : 'text-gray-400'} />
              {item.label}
            </Link>
          )
        })}
        <div className="pt-3 mt-3 border-t border-gray-100">
          {footerLinks.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-[5px] text-xs font-medium transition ${
                  isActive ? 'bg-rose-50 text-gray-900' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-rose-500' : ''} />
                {item.label}
              </Link>
            )
          })}
        </div>
        {isMobile && (
          <div className="pt-3 mt-3 border-t border-gray-100">
            {mobileNavLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-sm font-medium transition ${
                    isActive ? 'bg-rose-50 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-rose-600' : 'text-gray-400'} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-[5px] transition"
          >
            <LogOut size={16} />
            Log Out
          </button>
        ) : (
          <a
            href="/login"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-[5px] transition"
          >
            <LogOut size={16} />
            Log In
          </a>
        )}
      </div>
    </div>
  )
}

function SidebarControlled({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex w-64 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onNavigate={() => setIsOpen(false)} isMobile />
      </div>

      <FeedbackWidget />
    </>
  )
}
