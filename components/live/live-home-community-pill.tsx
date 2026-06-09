'use client'

import Link from 'next/link'
import { useLiveStats } from '@/hooks/use-live-stats'
import { Swords } from 'lucide-react'

export function LiveHomeCommunityPill() {
  const { data } = useLiveStats({ intervalMs: 25_000 })
  const duels = data?.community.totalDuelVotes
  const voters = data?.community.uniqueVoters

  if (duels == null) return null

  return (
    <Link
      href="/compare"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/25 bg-accent/[0.06] text-[11px] font-medium text-foreground hover:border-accent/40 transition-colors"
    >
      <Swords size={12} className="text-accent" />
      <span>
        <span className="font-mono font-bold text-accent tabular-nums">{duels}</span> duels communauté
        {voters != null && voters > 0 && (
          <span className="text-muted-foreground"> · {voters} votants</span>
        )}
      </span>
      <span className="text-accent text-[10px]">live →</span>
    </Link>
  )
}
