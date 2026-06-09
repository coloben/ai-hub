'use client'

import Link from 'next/link'
import { useLiveStats } from '@/hooks/use-live-stats'
import { Trophy, Users } from 'lucide-react'
import { CertifiedBadge } from '@/components/trust/certified-badge'

function modelLabel(id: string) {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

interface CommunityScoreboardProps {
  category?: string
  limit?: number
  compact?: boolean
}

export function CommunityScoreboard({
  category = 'global',
  limit = 10,
  compact = false,
}: CommunityScoreboardProps) {
  const { data, loading } = useLiveStats({ category, intervalMs: 20_000 })
  const rows = (data?.leaderboard ?? []).slice(0, limit)

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center gap-2">
        <Users size={compact ? 12 : 14} className="text-accent" />
        <p className={`font-semibold ${compact ? 'text-[11px]' : 'text-[13px]'}`}>
          Classement communauté AI Hub
        </p>
        <CertifiedBadge variant="community" className="ml-auto" />
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Basé sur les duels A vs B réels — taux de victoire par modèle. Mis à jour automatiquement.
      </p>

      {loading && rows.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground py-4 text-center">
          Aucun duel encore — votez sur le comparateur pour alimenter ce classement.
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-border/40">
          {rows.map((row, idx) => (
            <Link
              key={row.modelId}
              href={`/model/${row.modelId}`}
              className="flex items-center gap-2 py-2 hover:bg-muted/30 rounded px-1 -mx-1 transition-colors"
            >
              <span
                className={`text-xs font-mono font-bold w-5 text-center shrink-0 ${
                  idx < 3 ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`truncate font-medium ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
                  {modelLabel(row.modelId)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {row.wins}V · {row.losses}D · {row.duels} duels
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold font-mono tabular-nums ${compact ? 'text-[12px]' : 'text-sm'}`}>
                  {row.winRate}%
                </p>
                <p className="text-[9px] text-muted-foreground">win rate</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <p className="text-[9px] text-muted-foreground flex items-center gap-1">
          <Trophy size={9} />
          Score communauté = 1000 + bonus win% · rafraîchi toutes les 20s
        </p>
      )}
    </div>
  )
}
