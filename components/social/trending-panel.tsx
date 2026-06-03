import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash, Swords, Trophy } from 'lucide-react'
import Link from 'next/link'
import type { RankingData } from '@/lib/data/schema'
import { CertifiedBadge } from '@/components/trust/certified-badge'

export function TrendingPanel({ ranking }: { ranking: RankingData }) {
  const top5 = ranking.models.slice(0, 5)
  const tags = top5
    .flatMap((m) => m.name.toLowerCase().split(/[\s-]+/))
    .filter((t) => t.length > 3)
    .slice(0, 6)

  return (
    <div className="space-y-4">
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
            <Trophy size={12} className="text-accent" />
            Top Arena ELO
            <CertifiedBadge variant="arena" className="ml-auto normal-case" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {top5.map((m, i) => (
            <Link
              key={m.id}
              href={`/model/${m.id}`}
              className="flex items-center gap-2 py-1 hover:bg-muted/40 rounded px-1 -mx-1 transition-colors"
            >
              <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
              <span className="text-[13px] font-medium truncate flex-1">{m.name}</span>
              <span className="text-[12px] font-mono font-bold text-accent">{m.elo}</span>
            </Link>
          ))}
          {top5[0]?.samples != null && (
            <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/50">
              #{1} : {(top5[0].samples ?? 0).toLocaleString('fr-FR')} votes Arena certifiés
            </p>
          )}
          <Link href="/ranking" className="text-[11px] text-accent hover:underline block pt-1">
            Classement complet →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash size={14} className="text-accent" />
            Modèles du classement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="block py-1.5 text-sm font-medium hover:text-accent transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Swords size={14} className="text-accent" />
            <span className="text-sm font-semibold">Comparateur A vs B</span>
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">
            Chaque clic enregistre un vote réel (1 par paire et navigateur). Agrégé en pourcentages.
          </p>
          <Link
            href="/compare"
            className="inline-flex w-full items-center justify-center h-8 text-xs rounded-md bg-accent text-accent-foreground font-medium"
          >
            Voter maintenant
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
