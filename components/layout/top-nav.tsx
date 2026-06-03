'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Flame, Trophy, Swords, Users, Layers } from 'lucide-react'

const SiteSearch = dynamic(
  () => import('@/components/layout/site-search').then((m) => m.SiteSearch),
  { ssr: false, loading: () => null }
)

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
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="AI Hub — accueil">
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 to-accent-2/15 border border-accent/25 flex items-center justify-center group-hover:border-accent/50 transition-colors"
            aria-hidden
          >
            <Zap size={15} className="text-accent" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-base tracking-tight text-foreground block leading-none">
              AI Hub
            </span>
            <span className="text-[9px] text-muted-foreground tracking-wide">
              données Arena certifiées
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

        <SiteSearch />

        <Button size="sm" className="h-7 text-xs px-3 rounded-full font-semibold min-h-[44px] sm:min-h-0" asChild>
          <Link href="/signup">Profil</Link>
        </Button>
      </div>
    </header>
  )
}
