import Link from 'next/link'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { ArenaModel, ArenaScoreKind } from '@/lib/data/schema'
import { formatArenaScore, scoreKindLabel } from '@/lib/data/display-score'
import { CertifiedBadge } from '@/components/trust/certified-badge'

interface ArenaLeaderboardTableProps {
  models: ArenaModel[]
  scoreKind: ArenaScoreKind
  boardLabel: string
  source: string
  updatedAt: string
  limit?: number
}

export function ArenaLeaderboardTable({
  models,
  scoreKind,
  boardLabel,
  source,
  updatedAt,
  limit = 20,
}: ArenaLeaderboardTableProps) {
  const rows = models.slice(0, limit)

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40 mb-1">
        <p className="text-[11px] text-muted-foreground">
          {boardLabel} · {scoreKindLabel(scoreKind)}
        </p>
        <CertifiedBadge variant="arena" />
      </div>

      <div className="divide-y divide-border/40">
        {rows.map((m, idx) => {
          const { primary, interval } = formatArenaScore(m)
          const delta = m.eloDelta

          return (
            <Link
              key={`${m.id}-${m.arenaBoard ?? 'arena'}`}
              href={`/model/${m.id}`}
              className="flex items-center gap-3 py-2.5 px-1 hover:bg-muted/30 rounded transition-colors group"
            >
              <span
                className={`text-xs font-mono font-bold w-5 text-center shrink-0 ${
                  idx < 3 ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                {m.rank ?? idx + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate group-hover:text-accent transition-colors">
                  {m.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {m.organization}
                  {(m.samples ?? 0) > 0 && ` · ${(m.samples ?? 0).toLocaleString('fr-FR')} votes Arena`}
                </p>
              </div>

              <div className="text-right shrink-0 min-w-[4.5rem]">
                <p className="text-sm font-bold data-num text-foreground tabular-nums leading-tight">
                  {primary}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  {interval && (
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {interval}
                    </span>
                  )}
                  {delta !== 0 && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums ${
                        delta > 0 ? 'text-green-400' : 'text-destructive'
                      }`}
                    >
                      {delta > 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      {scoreKind === 'relative'
                        ? `${delta > 0 ? '+' : ''}${(delta / 100).toFixed(1)}%`
                        : `${delta > 0 ? '+' : ''}${delta}`}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-3">
        Source : {source} · Snapshot {updatedAt.slice(0, 10)} ·{' '}
        {new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}
