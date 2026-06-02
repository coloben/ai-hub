import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { getRanking } from '@/lib/data/pipeline'

export async function CommunityLeaderboard({ category }: { category: string }) {
  const ranking = await getRanking()
  const data = ranking.models.slice(0, 10)

  return (
    <div className="space-y-0 divide-y divide-border/40">
      {data.map((item, index) => {
        const TrendIcon = item.eloDelta > 0 ? ChevronUp : item.eloDelta < 0 ? ChevronDown : Minus
        const trendColor = item.eloDelta > 0 ? 'text-green-400' : item.eloDelta < 0 ? 'text-destructive' : 'text-muted-foreground'

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2 px-1 hover:bg-muted/30 rounded transition-colors"
          >
            <div className="w-5 text-center">
              {index < 3 ? (
                <Badge
                  variant="secondary"
                  className={`text-[9px] px-0.5 py-0 h-4 w-4 flex items-center justify-center rounded-full ${
                    index === 0 ? 'bg-accent/20 text-accent' : index === 1 ? 'bg-accent-2/20 text-accent-2' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground font-mono">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{item.name}</p>
              <p className="text-[9px] text-muted-foreground font-mono">{item.organization}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold data-num text-foreground">{item.elo}</p>
              <div className={`flex items-center justify-end gap-0.5 text-[9px] ${trendColor}`}>
                <TrendIcon size={9} />
                <span>{item.eloDelta > 0 ? `+${item.eloDelta}` : item.eloDelta < 0 ? `${item.eloDelta}` : '='}</span>
              </div>
            </div>
          </div>
        )
      })}
      <p className="text-[9px] text-muted-foreground text-center pt-2">
        Source : {ranking.source}
      </p>
    </div>
  )
}
