'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⊡' },
  { href: '/feed', label: 'Mon Feed', icon: '◬' },
  { href: '/news', label: 'Feed IA', icon: '◈' },
  { href: '/leaderboard', label: 'Classement', icon: '▲' },
  { href: '/benchmarks', label: 'Benchmarks', icon: '▤' },
  { href: '/compare', label: 'Comparer', icon: '⚖' },
  { href: '/alerts', label: 'Alertes', icon: '◉' },
]

const toolItems = [
  { href: '/briefing', label: 'Briefing', icon: '◫' },
  { href: '/cost-calculator', label: 'Coûts API', icon: '◊' },
  { href: '/timeline', label: 'Timeline', icon: '◐' },
  { href: '/glossary', label: 'Glossaire', icon: '◎' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[200px] bg-void-950 border-r border-border z-40 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-text-primary text-bg flex items-center justify-center text-sm font-bold">
            AI
          </span>
          <span className="font-semibold text-text-primary">Hub</span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className={`text-lg ${isActive ? 'text-accent' : 'text-text-tertiary'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-4 border-t border-divider" />

        {/* Tools section */}
        <p className="px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-text-quaternary">
          Outils
        </p>
        {toolItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className={`text-lg ${isActive ? 'text-accent' : 'text-text-tertiary'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-border">
        <Link
          href="/submit"
          className="btn-secondary w-full mb-3"
        >
          <span className="text-accent">+</span>
          <span>Poster</span>
        </Link>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-text-tertiary">
            <span className="live-dot" />
            <span className="text-xs">Live</span>
          </div>
          <span className="text-2xs text-text-quaternary">v1.0</span>
        </div>
      </div>
    </aside>
  )
}
