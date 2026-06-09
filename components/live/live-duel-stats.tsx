'use client'

import { useLiveStats } from '@/hooks/use-live-stats'
import { CertifiedBadge } from '@/components/trust/certified-badge'
import { Radio } from 'lucide-react'

export function LiveDuelStats({ category }: { category: string }) {
  const { data, loading, error } = useLiveStats({ category, intervalMs: 15_000 })

  const total = data?.community.totalDuelVotes ?? 0
  const catVotes = data?.community.votesByCategory[category] ?? 0
  const voters = data?.community.uniqueVoters ?? 0
  const persisted = data?.community.persisted ?? false
  const generatedAt = data?.generatedAt

  return (
    <div className="rounded-lg border border-border/80 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold">Votes comparateur</p>
        <div className="flex items-center gap-1.5">
          {!loading && (
            <span className="flex items-center gap-1 text-[9px] text-accent font-medium" title="Mise à jour auto">
              <Radio size={10} className="animate-pulse" />
              live
            </span>
          )}
          <CertifiedBadge variant="community" />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono text-foreground tabular-nums">
        {loading && !data ? '…' : total}
      </p>
      <p className="text-[10px] text-muted-foreground">duels enregistrés (toutes catégories)</p>
      <p className="text-[10px] text-muted-foreground">
        Catégorie <strong className="text-foreground">{category}</strong> :{' '}
        <span className="font-mono tabular-nums">{loading && !data ? '…' : catVotes}</span> votes
      </p>
      <p className="text-[10px] text-muted-foreground">
        {persisted
          ? 'Postgres actif — agrégats recalculés à chaque vote.'
          : 'Sans DATABASE_URL, les compteurs ne sont pas fiables en production.'}
      </p>
      <p className="text-[10px] text-muted-foreground">
        <span className="font-mono tabular-nums">{voters}</span> navigateurs uniques ont voté
      </p>
      {error && <p className="text-[10px] text-destructive">{error}</p>}
      {generatedAt && (
        <p className="text-[9px] text-muted-foreground/70">
          MAJ {new Date(generatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </div>
  )
}
