'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',            label: 'Dashboard' },
  { href: '/news',        label: 'Feed IA' },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/benchmarks',  label: 'Benchmarks' },
  { href: '/compare',     label: 'Comparer' },
  { href: '/alerts',      label: 'Alertes' },
]

export function NavHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 h-12 border-b border-border bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1440px] items-center px-6">
        <Link href="/" className="mr-8 text-sm font-bold tracking-tight text-text shrink-0">
          AI Hub
        </Link>
        <nav className="flex flex-1 items-center">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-12 items-center border-b-2 px-4 text-xs font-medium transition-colors
                  ${isActive
                    ? 'border-text text-text'
                    : 'border-transparent text-text-2 hover:text-text'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
          <span className="text-xs text-text-2 tracking-wide">Live</span>
        </div>
      </div>
    </header>
  )
}
