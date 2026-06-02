'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Flame, Trophy, Swords, Users, Bookmark, UserCircle, Settings,
  Plus, TrendingUp,
} from 'lucide-react'
import { HUBS } from '@/lib/social/hubs'
import { cn } from '@/lib/utils'

const MAIN_LINKS = [
  { href: '/', icon: Flame, label: 'Feed' },
  { href: '/hubs', icon: Users, label: 'Hubs' },
  { href: '/ranking', icon: Trophy, label: 'Classement' },
  { href: '/compare', icon: Swords, label: 'Comparer' },
  { href: '/community', icon: TrendingUp, label: 'Communauté' },
  { href: '/bookmarks', icon: Bookmark, label: 'Signets' },
]

export function HubSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeHub = searchParams.get('hub')

  return (
    <nav className="sticky top-14 space-y-4 hidden lg:block" aria-label="Navigation">
      <div className="space-y-0.5">
        {MAIN_LINKS.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href || (link.href === '/' && pathname === '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'text-accent bg-accent-dim'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>

      <div>
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Hubs IA
        </p>
        <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1">
          {HUBS.map((hub) => {
            const Icon = hub.icon
            const active = activeHub === hub.id
            return (
              <Link
                key={hub.id}
                href={`/?hub=${hub.id}`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors',
                  active
                    ? 'text-accent bg-accent-dim font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon size={15} className={hub.color} />
                <span className="truncate">h/{hub.id}</span>
                <span className="ml-auto text-[10px] opacity-50">{hub.memberCount}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 mx-2 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus size={16} />
        Nouveau post
      </Link>

      <div className="pt-2 border-t border-border space-y-0.5">
        <Link
          href="/signup"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <UserCircle size={18} />
          Profil
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Settings size={18} />
          Paramètres
        </Link>
      </div>
    </nav>
  )
}
