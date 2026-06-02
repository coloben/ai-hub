import { getRanking } from '@/lib/data/pipeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import Link from 'next/link'

export async function DataRankingWidget() {
  const ranking = await getRanking()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy size={16} className="text-accent" />
            Top ELO Arena
          </CardTitle>
          <Link href="/ranking" className="text-xs text-accent hover:underline">
            Voir tout
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {ranking.models.slice(0, 10).map((m, idx) => (
          <div
            key={m.id}
            className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
          >
            <span
              className={`text-xs font-mono font-bold w-5 text-center ${
                idx < 3 ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
              <p className="text-[10px] text-muted-foreground">{m.organization}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-bold text-foreground">{m.elo}</p>
              <p
                className={`text-[10px] font-mono ${
                  m.eloDelta > 0
                    ? 'text-green-400'
                    : m.eloDelta < 0
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                }`}
              >
                {m.eloDelta > 0 ? `+${m.eloDelta}` : m.eloDelta < 0 ? `${m.eloDelta}` : '—'}
              </p>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          Source : {ranking.source} · Mis à jour {new Date(ranking.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </CardContent>
    </Card>
  )
}
