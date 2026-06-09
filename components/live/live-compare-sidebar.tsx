'use client'

import { useLiveStats } from '@/hooks/use-live-stats'
import { TrendingUp } from 'lucide-react'

function fmtK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function LiveCompareSidebar({ category }: { category: string }) {
  const { data, loading } = useLiveStats({ category, intervalMs: 15_000 })

  const arenaVotes = data?.arena.votesTotal ?? 0
  const duels = data?.community.totalDuelVotes ?? 0
  const models = data?.arena.modelCount ?? 0

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div>
        <p className="text-sm font-bold data-num text-accent-2 tabular-nums">
          {loading && !data ? '…' : fmtK(arenaVotes)}
        </p>
        <p className="text-[9px] text-muted-foreground">Votes Arena</p>
      </div>
      <div>
        <p className="text-sm font-bold data-num text-accent tabular-nums">
          {loading && !data ? '…' : duels}
        </p>
        <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
          <TrendingUp size={8} className="text-accent" />
          Duels live
        </p>
      </div>
      <div>
        <p className="text-sm font-bold data-num text-foreground tabular-nums">
          {loading && !data ? '…' : models}
        </p>
        <p className="text-[9px] text-muted-foreground">Modèles</p>
      </div>
    </div>
  )
}
