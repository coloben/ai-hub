'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Flame, Trophy, Swords, Users, Search, Bell, Layers } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Flame, label: 'Feed' },
  { href: '/hubs', icon: Layers, label: 'Hubs' },
  { href: '/ranking', icon: Trophy, label: 'Classement' },
  { href: '/compare', icon: Swords, label: 'Comparer' },
  { href: '/community', icon: Users, label: 'Communauté' },
]

interface TopNavProps {
  active?: string
}

export function TopNav({ active }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 glass-header border-b border-border/80">
      <div className="max-w-[1280px] mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 to-accent-2/15 border border-accent/25 flex items-center justify-center group-hover:border-accent/50 transition-colors">
            <Zap size={15} className="text-accent" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-base tracking-tight text-foreground block leading-none">
              AI Hub
            </span>
            <span className="text-[9px] text-muted-foreground tracking-wide">
              communauté IA · FR
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.label
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'text-accent bg-accent-dim'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-8 w-8 hidden sm:flex"
            aria-label="Rechercher"
            title="Recherche — bientôt"
            disabled
          >
            <Search size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-8 w-8"
            aria-label="Notifications"
            title="Notifications — bientôt"
            disabled
          >
            <Bell size={15} />
          </Button>
          <Button size="sm" className="ml-1 h-7 text-xs px-3 rounded-full font-semibold" asChild>
            <Link href="/signup">Rejoindre</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
