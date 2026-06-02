import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Trophy, Database, Clock } from 'lucide-react'
import { getRanking } from '@/lib/data/pipeline'

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

export async function HomeStatsBar() {
  const ranking = await getRanking()
  const top = ranking.models[0]
  const arenaVotes = ranking.models.reduce((sum, m) => sum + (m.samples ?? 0), 0)
  const updated = new Date(ranking.updatedAt).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const stats = [
    { label: 'Modèles', value: String(ranking.models.length), icon: BarChart3 },
    { label: 'Top ELO', value: top ? String(top.elo) : '—', icon: Trophy },
    { label: 'Votes Arena', value: fmt(arenaVotes), icon: Database },
    { label: 'MAJ', value: updated, icon: Clock },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="bg-card/80 backdrop-blur-sm card-lift inner-glow">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} className="text-accent" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
                <p className="text-xl font-black data-num text-foreground leading-none truncate" title={s.value}>
                  {s.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
