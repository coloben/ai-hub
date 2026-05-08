'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Newspaper, Trophy, BarChart3, GitCompare, Bell,
  FileText, Calculator, Clock, BookOpen, Plus, Settings, Rss
} from 'lucide-react'

const mainItems = [
  { href: '/', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/news', icon: Newspaper, label: 'Feed IA' },
  { href: '/feed', icon: Rss, label: 'Mon Feed' },
  { href: '/leaderboard', icon: Trophy, label: 'Classement' },
  { href: '/benchmarks', icon: BarChart3, label: 'Benchmarks' },
  { href: '/compare', icon: GitCompare, label: 'Comparer' },
  { href: '/alerts', icon: Bell, label: 'Alertes' },
]

const toolItems = [
  { href: '/briefing', icon: FileText, label: 'Briefing' },
  { href: '/cost-calculator', icon: Calculator, label: 'Coûts' },
  { href: '/timeline', icon: Clock, label: 'Timeline' },
  { href: '/glossary', icon: BookOpen, label: 'Glossaire' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop rail — left edge, 56px */}
      <aside className="fixed left-0 top-0 bottom-0 w-14 border-r border-white/[0.06] z-40 hidden md:flex flex-col" style={{ backgroundColor: '#0B0B0F' }}>
        {/* Logo mark */}
        <div className="h-14 flex items-center justify-center border-b border-white/[0.06]">
          <Link href="/" className="w-8 h-8 rounded-lg bg-white text-[#0B0B0F] flex items-center justify-center text-xs font-extrabold">
            AI
          </Link>
        </div>

        {/* Main nav */}
        <nav className="nav-rail flex-1 py-2">
          {mainItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'active' : ''}
                title={item.label}
                aria-label={item.label}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </Link>
            )
          })}

          <div className="w-5 h-px bg-white/10 my-2" />

          {toolItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'active' : ''}
                title={item.label}
                aria-label={item.label}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="nav-rail pb-2">
          <Link href="/submit" title="Poster" aria-label="Poster">
            <Plus size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/settings" title="Paramètres" aria-label="Paramètres">
            <Settings size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 border-t border-white/[0.06] z-40 flex items-center justify-around md:hidden" style={{ backgroundColor: '#0B0B0F' }}>
        {mainItems.slice(0, 6).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-white' : 'text-white/35'}`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px]">{item.label.slice(0, 6)}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
