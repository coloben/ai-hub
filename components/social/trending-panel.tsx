import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash, Radio, Swords, Trophy } from 'lucide-react'
import Link from 'next/link'
import { getRanking } from '@/lib/data/pipeline'

export async function TrendingPanel() {
  const ranking = await getRanking()
  const top3 = ranking.models.slice(0, 3)
  const tags = ['claude', 'gemini', 'gpt-5', 'deepseek', 'llama', 'arena']

  return (
    <div className="space-y-4">
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Radio size={12} className="text-success animate-pulse-soft" />
            Live Arena
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {top3.map((m, i) => (
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
          <Link href="/ranking" className="text-[11px] text-accent hover:underline block pt-1">
            Classement complet →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash size={14} className="text-accent" />
            Trending
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
            <span className="text-sm font-semibold">Duel en cours</span>
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">
            Votez A vs B — chaque vote alimente le classement communautaire.
          </p>
          <Link
            href="/compare"
            className="inline-flex w-full items-center justify-center h-8 text-xs rounded-md bg-accent text-accent-foreground font-medium"
          >
            Comparer
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-accent-dim/30 border-accent/20">
        <CardContent className="p-3 text-[11px] text-muted-foreground leading-relaxed">
          <Trophy size={12} className="text-accent inline mr-1 mb-0.5" />
          Algo Hot : score ÷ âge² · transparent ·{' '}
          <Link href="/about" className="text-accent hover:underline">
            en savoir plus
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
