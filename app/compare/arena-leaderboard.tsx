import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getRanking } from '@/lib/data/pipeline'
import { CertifiedBadge } from '@/components/trust/certified-badge'

export async function ArenaLeaderboard() {
  const ranking = await getRanking()
  const data = ranking.models.slice(0, 10)

  return (
    <div className="space-y-0 divide-y divide-border/40">
      <div className="flex items-center justify-between pb-2">
        <p className="text-[11px] font-semibold text-foreground">Classement Arena (global)</p>
        <CertifiedBadge variant="arena" />
      </div>
      {data.map((item, index) => (
        <Link
          key={item.id}
          href={`/model/${item.id}`}
          className="flex items-center gap-3 py-2 px-1 hover:bg-muted/30 rounded transition-colors"
        >
          <div className="w-5 text-center">
            {index < 3 ? (
              <Badge
                variant="secondary"
                className={`text-[9px] px-0.5 py-0 h-4 w-4 flex items-center justify-center rounded-full ${
                  index === 0
                    ? 'bg-accent/20 text-accent'
                    : index === 1
                      ? 'bg-accent-2/20 text-accent-2'
                      : 'bg-muted text-muted-foreground'
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
            <p className="text-[9px] text-muted-foreground font-mono">
              {item.organization}
              {(item.samples ?? 0) > 0 && ` · ${(item.samples ?? 0).toLocaleString('fr-FR')} votes Arena`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-bold data-num text-foreground">{item.elo}</p>
            <p className="text-[9px] text-muted-foreground">ELO</p>
          </div>
        </Link>
      ))}
      <p className="text-[9px] text-muted-foreground text-center pt-2">
        Source : {ranking.source} · non modifié par les duels AI Hub
      </p>
    </div>
  )
}
