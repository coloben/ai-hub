'use client'

import { Button } from '@/components/ui/button'
import { Hash, BarChart3, Eye, UserCircle } from 'lucide-react'

const SOON = 'Bientôt disponible — nécessite un compte'

export function PostComposerDisabled() {
  return (
    <div className="px-4 pt-3 pb-2 border-b border-border opacity-60" title={SOON}>
      <div className="flex gap-3 pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <UserCircle size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            disabled
            aria-disabled
            placeholder="Publication communautaire — bientôt"
            className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground h-9 cursor-not-allowed"
          />
        </div>
        <Button size="sm" disabled className="rounded-full px-4 h-8">
          Poster
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground ml-12 mt-1">{SOON}</p>
    </div>
  )
}

const TABS = ['Hot', 'Top', 'New', 'Rising'] as const

export function FeedTabsDisabled() {
  return (
    <div
      className="flex border-b border-border sticky top-12 z-40 bg-card/95 backdrop-blur opacity-70"
      role="tablist"
      aria-label="Tri du feed"
    >
      {TABS.map((label, i) => (
        <button
          key={label}
          type="button"
          disabled
          aria-disabled
          title={SOON}
          className={`flex-1 py-2.5 text-sm font-medium cursor-not-allowed ${
            i === 2 ? 'text-accent' : 'text-muted-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
