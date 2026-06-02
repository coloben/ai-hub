import { Clock, Database, Info } from 'lucide-react'
import { getRanking } from '@/lib/data/pipeline'

export async function RankingMetaBar() {
  const ranking = await getRanking()
  const updated = new Date(ranking.updatedAt).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isFallback = ranking.source.includes('fallback')
  const refreshLabel = isFallback
    ? 'Données de secours (Arena indisponible)'
    : 'Rafraîchissement auto toutes les 5 min'

  return (
    <div className="rounded-lg border border-border/80 bg-card/60 px-3 py-2.5 text-[11px] text-muted-foreground space-y-1.5">
      <div className="flex items-start gap-2">
        <Info size={14} className="text-accent shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground">ELO affiché</strong> = classement{' '}
          <a
            href="https://lmarena.ai/leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Chatbot Arena
          </a>{' '}
          (votes humains en duel sur l&apos;Arena). Les votes du comparateur ci-dessous sont{' '}
          <strong className="text-foreground">séparés</strong> : ils alimentent les barres % par paire,
          pas l&apos;ELO Arena.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-5">
        <span className="flex items-center gap-1">
          <Database size={12} className="text-accent-2" />
          Source : <span className="font-mono text-foreground/80">{ranking.source}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Dernière MAJ : <span className="text-foreground/80">{updated}</span>
        </span>
        <span>{refreshLabel}</span>
      </div>
    </div>
  )
}
