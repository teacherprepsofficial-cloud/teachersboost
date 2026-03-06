'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, TrendingUp, Telescope, Wand2, FileText } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/keywords',              label: 'Keywords',    Icon: Search },
  { href: '/trending',              label: 'Trending',    Icon: TrendingUp },
  { href: '/niche-finder',          label: 'Niche',       Icon: Telescope },
  { href: '/title-generator',       label: 'Titles',      Icon: Wand2 },
  { href: '/description-generator', label: 'Description', Icon: FileText },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || (href !== '/trending' && href !== '/keywords' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
          >
            <Icon
              size={22}
              className={isActive ? 'text-rose-600' : 'text-gray-400'}
            />
            <span className={`text-[10px] font-semibold ${isActive ? 'text-rose-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
