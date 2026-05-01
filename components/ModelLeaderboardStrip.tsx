import { Model } from '@/lib/types'

interface ModelLeaderboardStripProps {
  models: Model[]
}

export function ModelLeaderboardStrip({ models }: ModelLeaderboardStripProps) {
  const topModels = models.slice(0, 5)
  
  return (
    <div className="border-t border-divider bg-surface p-4">
      <div className="flex items-center gap-6 overflow-x-auto">
        <span className="text-2xs font-medium text-text-muted uppercase shrink-0">
Top 5
        </span>
        {topModels.map((model, index) => (
          <div key={model.id} className="flex items-center gap-3 shrink-0">
            <span className="text-2xs font-mono text-text-faint">#{index + 1}</span>
            <span className="text-sm font-medium">{model.name}</span>
            <span className="text-2xs text-text-muted">{model.provider}</span>
            <span className="text-sm font-mono tabular-nums text-primary">
              {model.scores.arena_elo}
            </span>
            {model.rank_delta_7d !== 0 && (
              <span className={`text-2xs ${model.rank_delta_7d > 0 ? 'text-success' : 'text-error'}`}>
                {model.rank_delta_7d > 0 ? '+' : ''}{model.rank_delta_7d}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
