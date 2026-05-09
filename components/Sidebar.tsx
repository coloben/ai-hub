'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Newspaper, Trophy, BarChart3, GitCompare, Bell,
  FileText, Calculator, Clock, BookOpen, Plus, Settings, Rss,
  ChevronRight
} from 'lucide-react'

const mainItems = [
  { href: '/', icon: LayoutGrid, label: 'Dashboard', short: 'Home' },
  { href: '/news', icon: Newspaper, label: 'Feed IA', short: 'News' },
  { href: '/feed', icon: Rss, label: 'Mon Feed', short: 'Feed' },
  { href: '/leaderboard', icon: Trophy, label: 'Classement', short: 'Top' },
  { href: '/benchmarks', icon: BarChart3, label: 'Benchmarks', short: 'Bench' },
  { href: '/compare', icon: GitCompare, label: 'Comparer', short: 'VS' },
  { href: '/alerts', icon: Bell, label: 'Alertes', short: 'Alertes' },
]

const toolItems = [
  { href: '/briefing', icon: FileText, label: 'Briefing' },
  { href: '/cost-calculator', icon: Calculator, label: 'Calculateur' },
  { href: '/timeline', icon: Clock, label: 'Timeline' },
  { href: '/glossary', icon: BookOpen, label: 'Glossaire' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — 220px labeled */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-[220px] z-40 hidden md:flex flex-col border-r border-white/[0.06]"
        style={{ backgroundColor: '#0B0B0F' }}
      >
        {/* Logo + brand */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/[0.06] shrink-0">
          <div className="w-7 h-7 rounded-[6px] bg-white flex items-center justify-center text-[10px] font-black text-[#0B0B0F] shrink-0 tracking-tight">
            AI
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-white leading-none tracking-tight">AI Hub</p>
            <div className="flex items-center gap-1.5 mt-[3px]">
              <span className="live-dot" style={{ width: 6, height: 6, minWidth: 6 }} />
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.10em]">Live</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {/* Main */}
          <div className="px-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/20 px-2 mb-1.5">
              Navigation
            </p>
            {mainItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2.5 px-2 py-[7px] rounded-lg mb-0.5 transition-all duration-150 group
                    ${isActive
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
                    }
                  `}
                >
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="shrink-0"
                  />
                  <span className="text-[13px] font-medium leading-none">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={12} className="ml-auto opacity-30" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="mx-5 my-3 h-px bg-white/[0.06]" />

          {/* Tools */}
          <div className="px-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/20 px-2 mb-1.5">
              Outils
            </p>
            {toolItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2.5 px-2 py-[7px] rounded-lg mb-0.5 transition-all duration-150
                    ${isActive
                      ? 'bg-white text-black'
                      : 'text-white/35 hover:text-white/70 hover:bg-white/[0.05]'
                    }
                  `}
                >
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
                  <span className="text-[13px] font-medium leading-none">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5 shrink-0">
          <Link
            href="/submit"
            className="flex items-center gap-2.5 px-2 py-[7px] rounded-lg text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-all duration-150"
          >
            <Plus size={14} strokeWidth={1.8} className="shrink-0" />
            <span className="text-[13px] font-medium">Soumettre</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2 py-[7px] rounded-lg text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-all duration-150"
          >
            <Settings size={14} strokeWidth={1.8} className="shrink-0" />
            <span className="text-[13px] font-medium">Paramètres</span>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-14 border-t border-white/[0.06] z-40 flex items-center justify-around md:hidden"
        style={{ backgroundColor: '#0B0B0F' }}
      >
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
              <span className="text-[10px]">{item.short}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
