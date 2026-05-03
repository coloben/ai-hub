'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navSections = [
  {
    title: 'Signal',
    items: [
      { href: '/', label: 'Command Center', icon: '✦' },
      { href: '/live', label: 'Live Feed', icon: '●' },
      { href: '/briefing', label: 'Briefing quotidien', icon: '◈' },
      { href: '/news', label: 'Radar Actu', icon: '◉' },
      { href: '/alerts', label: 'Alertes', icon: '⚑' },
      { href: '/leaderboard', label: 'Power Ranking', icon: '◆' },
      { href: '/benchmarks', label: 'Lab Benchmarks', icon: '◎' },
      { href: '/timeline', label: 'Chronologie', icon: '⌁' },
    ]
  },
  {
    title: 'Décision',
    items: [
      { href: '/compare', label: 'Decision Engine', icon: '⚖' },
      { href: '/cost-calculator', label: 'Coûts API', icon: '◍' },
      { href: '/glossary', label: 'Glossaire IA', icon: '◇' },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-[248px] min-h-[calc(100vh-32px)] bg-[#070711]/78 backdrop-blur-2xl border-r border-white/10 sticky top-[32px] hidden md:flex flex-col shadow-[20px_0_80px_rgba(0,0,0,0.28)]">
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary-dim/70 text-primary signal-ring overflow-hidden">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_35%)]"></span>
            <span className="relative text-sm">AI</span>
          </span>
          <span>
            <span className="block font-semibold text-sm tracking-wide text-gradient-intel">IA Intelligence</span>
            <span className="block text-2xs font-mono text-text-faint uppercase tracking-[0.22em]">World Signal</span>
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 p-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="px-3 py-2 text-2xs font-medium text-text-faint uppercase tracking-[0.22em]">{section.title}</div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all overflow-hidden ${
                        isActive 
                          ? 'bg-white/[0.08] text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' 
                          : 'text-text-muted hover:text-text hover:bg-white/[0.045]'
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary"></span>}
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/[0.04] text-text-faint group-hover:text-primary'}`}>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        
        <div className="mt-6 px-1">
          <button 
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-text-muted hover:text-text bg-white/[0.035] hover:bg-white/[0.065] border border-white/10 transition-colors"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
            }}
          >
            <span className="text-xs text-primary">⌘</span>
            <span>Recherche</span>
            <span className="ml-auto text-2xs font-mono text-text-faint">⌘K</span>
          </button>
        </div>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="intel-card rounded-2xl p-3 border-l-2 border-l-primary">
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-mono text-primary">Live Intelligence</span>
          </div>
          <div className="mt-2 text-[10px] leading-relaxed text-text-faint">
            15+ sources • Polling 15min/1h/24h • Circuit breaker
          </div>
        </div>
        <Link 
          href="/live"
          className="mt-3 flex items-center justify-between text-2xs text-text-muted hover:text-primary transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="font-mono">Sync: &lt; 15min</span>
          </span>
          <span>Voir Live →</span>
        </Link>
      </div>
    </aside>
  )
}
