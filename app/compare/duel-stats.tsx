import { getCommunityStats } from '@/lib/votes/stats'
import { CertifiedBadge } from '@/components/trust/certified-badge'

export async function DuelStatsPanel({ category }: { category: string }) {
  const stats = await getCommunityStats()
  const catVotes = stats.votesByCategory[category] ?? 0

  return (
    <div className="rounded-lg border border-border/80 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold">Votes comparateur</p>
        <CertifiedBadge variant="community" />
      </div>
      <p className="text-2xl font-bold font-mono text-foreground">{stats.totalDuelVotes}</p>
      <p className="text-[10px] text-muted-foreground">duels enregistrés (toutes catégories)</p>
      <p className="text-[10px] text-muted-foreground">
        Catégorie <strong className="text-foreground">{category}</strong> :{' '}
        <span className="font-mono">{catVotes}</span> votes
      </p>
      <p className="text-[10px] text-muted-foreground">
        {stats.persisted
          ? 'Stockage Postgres actif — compteurs fiables à l’échelle.'
          : 'Sans DATABASE_URL sur Vercel, les votes peuvent ne pas persister entre déploiements.'}
      </p>
      <p className="text-[10px] text-muted-foreground">
        {stats.uniqueVoters} navigateurs uniques ont voté
      </p>
    </div>
  )
}
