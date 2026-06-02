'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Flame, Trophy, Swords, Users, Search, Bell } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Flame, label: 'Feed' },
  { href: '/ranking', icon: Trophy, label: 'Classement' },
  { href: '/compare', icon: Swords, label: 'Comparer' },
  { href: '/community', icon: Users, label: 'Communauté' },
]

interface TopNavProps {
  active?: string
}

export function TopNav({ active }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Zap size={14} className="text-accent" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="font-display font-bold text-base tracking-tight text-foreground">
              AI Hub
            </span>
            <span className="text-[10px] font-medium text-muted-foreground border-l border-border pl-1.5 ml-0.5">
              FR
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
            disabled
            className="text-muted-foreground h-8 w-8 opacity-50 cursor-not-allowed"
            aria-label="Rechercher — bientôt disponible"
            title="Recherche — bientôt disponible"
          >
            <Search size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="text-muted-foreground h-8 w-8 opacity-50 cursor-not-allowed"
            aria-label="Notifications — bientôt disponible"
            title="Notifications — bientôt disponible"
          >
            <Bell size={15} />
          </Button>
          <Button size="sm" variant="outline" className="ml-1 h-7 text-xs px-3 rounded-md font-medium" asChild>
            <Link href="/signup">Connexion</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
