'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import {
  TrendingUp, Search, Bookmark, Telescope, Wand2, FileText,
  Star, Settings, HelpCircle, Info, Phone, Shield, ScrollText, ShieldCheck, DollarSign
} from 'lucide-react'

const PAGE_META: Record<string, { label: string; Icon: React.ElementType }> = {
  '/trending':              { label: 'Keywords Trending Now on TpT', Icon: TrendingUp },
  '/keywords':              { label: 'TpT Keyword Explorer',    Icon: Search },
  '/saved-keywords':        { label: 'Keyword Notebook',             Icon: Bookmark },
  '/niche-finder':          { label: 'Niche Finder',                 Icon: Telescope },
  '/title-generator':       { label: 'Title Generator',              Icon: Wand2 },
  '/description-generator': { label: 'Description Writer',           Icon: FileText },
  '/testimonials':          { label: 'Testimonials',                 Icon: Star },
  '/settings':              { label: 'My Account',                   Icon: Settings },
  '/pricing':               { label: 'Pricing',                      Icon: DollarSign },
  '/faq':                   { label: 'FAQ',                          Icon: HelpCircle },
  '/about':                 { label: 'About',                        Icon: Info },
  '/contact':               { label: 'Contact',                      Icon: Phone },
  '/privacy':               { label: 'Privacy Policy',               Icon: Shield },
  '/terms':                 { label: 'Terms & Conditions',           Icon: ScrollText },
  '/admin':                 { label: 'Admin',                        Icon: ShieldCheck },
}

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
  { href: '/about',   label: 'About' },
]

interface TopBarProps {
  onMobileMenuToggle?: () => void
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [stats, setStats] = useState<{ members: number; online: number } | null>(null)

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
      .catch(() => {})
  }, [])

  const meta = PAGE_META[pathname] ??
    Object.entries(PAGE_META).find(([k]) => k !== '/trending' && k !== '/keywords' && pathname.startsWith(k))?.[1]

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 shrink-0 overflow-hidden">

      {/* Mobile: logo left + hamburger right */}
      <div className="md:hidden flex items-center justify-between w-full px-4 py-3">
        <Link href="/keywords" className="text-lg font-black tracking-tight">
          <span className="text-gray-900">Teachers</span><span className="text-rose-600">Boost</span>
        </Link>
        <button
          onClick={onMobileMenuToggle}
          className="bg-rose-600 text-white p-2 rounded-[5px]"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop: logo fixed-width left */}
      <div className="hidden md:flex w-64 shrink-0 justify-center px-5 py-4 border-r border-gray-200">
        <Link href="/keywords" className="text-lg font-black tracking-tight">
          <span className="text-gray-900">Teachers</span><span className="text-rose-600">Boost</span>
        </Link>
      </div>

      {/* Desktop: stats */}
      {stats && (
        <div className="hidden md:flex items-center gap-3 px-6 py-4 text-sm text-gray-500">
          <span>👥 <span className="font-semibold text-gray-700">{stats.members}</span> members</span>
          <span className="text-gray-300">·</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 align-middle" />
            <span className="font-semibold text-gray-700">{stats.online}</span> online now
          </span>
        </div>
      )}

      {/* Desktop: page title */}
      <div className="hidden md:flex items-center gap-2.5 flex-1 px-8 py-4">
        {meta && (
          <>
            <meta.Icon size={17} className="text-rose-500 shrink-0" />
            <h1 className="text-base font-bold text-gray-900">{meta.label}</h1>
          </>
        )}
      </div>

      {/* Desktop: nav links + auth */}
      <div className="hidden md:flex items-center gap-5 px-8 py-4">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition ${
              pathname === link.href ? 'text-rose-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {status === 'loading' ? null : session?.user ? (
          <>
            <Link
              href="/settings"
              className={`text-sm font-medium transition ${
                pathname === '/settings' ? 'text-rose-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              My Account
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/settings" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
              My Account
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-rose-600 text-white px-4 py-1.5 rounded-[5px] hover:bg-rose-700 transition">
              Sign up free
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
