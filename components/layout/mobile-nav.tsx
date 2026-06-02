'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Trophy, Swords, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/', icon: Flame, label: 'Feed' },
  { href: '/hubs', icon: Users, label: 'Hubs' },
  { href: '/compare', icon: Swords, label: 'Vote' },
  { href: '/ranking', icon: Trophy, label: 'ELO' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-pb"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium',
                active ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/"
          className="flex flex-col items-center justify-center -mt-4"
          aria-label="Nouveau post"
        >
          <span className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Plus size={22} className="text-accent-foreground" />
          </span>
        </Link>
      </div>
    </nav>
  )
}
