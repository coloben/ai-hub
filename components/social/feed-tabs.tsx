'use client'

import { cn } from '@/lib/utils'
import type { FeedSort } from '@/lib/social/schema'

const TABS: { id: FeedSort; label: string }[] = [
  { id: 'hot', label: 'Hot' },
  { id: 'top', label: 'Top' },
  { id: 'new', label: 'New' },
  { id: 'rising', label: 'Rising' },
]

interface FeedTabsProps {
  active: FeedSort
  onChange: (sort: FeedSort) => void
}

export function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div
      className="flex border-b border-border sticky top-12 z-40 bg-card/95 backdrop-blur-md"
      role="tablist"
      aria-label="Tri du feed"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors relative',
            active === tab.id
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}
