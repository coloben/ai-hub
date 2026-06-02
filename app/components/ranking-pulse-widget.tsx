import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { getRanking } from '@/lib/data/pipeline'

export async function RankingPulseWidget() {
  const ranking = await getRanking()
  const top3 = ranking.models.slice(0, 3)

  return (
    <Card className="bg-accent/5 border-accent/10">
      <CardContent className="p-3">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2.5">
          Top Arena — {ranking.source}
        </p>
        <div className="space-y-2">
          {top3.map((m, i) => (
            <Link
              key={m.id}
              href={`/model/${m.id}`}
              className="flex items-center gap-2 text-xs hover:bg-accent/5 rounded px-1 -mx-1 py-0.5 transition-colors"
            >
              <span className="font-mono text-accent w-4">{i + 1}</span>
              <span className="text-muted-foreground flex-1 truncate">{m.name}</span>
              <span className="font-mono text-foreground">{m.elo}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
