import { Model } from '@/lib/types'

interface TopModelsSidebarProps {
  models: Model[]
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    'Anthropic': 'text-[#9f1239]',
    'OpenAI': 'text-[#374151]',
    'Google': 'text-[#1d4ed8]',
    'Meta': 'text-[#6d28d9]',
    'Mistral': 'text-[#c2410c]',
    'xAI': 'text-[#dc2626]',
    'Cohere': 'text-[#0891b2]',
  }
  return colors[provider] || 'text-primary'
}

export function TopModelsSidebar({ models }: TopModelsSidebarProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-text-muted mb-4 uppercase tracking-wider">
Top Modèles
      </h2>
      <div className="space-y-3">
        {models.map((model, index) => (
          <div 
            key={model.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <span className="text-xs font-mono text-text-faint w-4">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium truncate ${getProviderColor(model.provider)}`}>
                  {model.provider}
                </span>
                <span className="text-2xs text-text-faint">
                  {model.type === 'open' ? 'Libre' : 'API'}
                </span>
              </div>
              <div className="text-sm font-medium truncate">
                {model.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono tabular-nums">
                {model.scores.arena_elo || '—'}
              </div>
              {model.rank_delta_7d !== 0 && (
                <div className={`text-2xs font-mono ${
                  model.rank_delta_7d > 0 ? 'text-success' : 'text-error'
                }`}>
                  {model.rank_delta_7d > 0 ? '▲' : '▼'} {Math.abs(model.rank_delta_7d)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
