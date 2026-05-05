import { NewsItem } from '@/lib/types'
import { timeAgo } from '@/lib/constants'

interface BreakingAlertsProps {
  items: NewsItem[]
}

export function BreakingAlerts({ items }: BreakingAlertsProps) {
  if (items.length === 0) return null

  return (
    <div className="mb-8">
      <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">Alertes actives</p>
      <div className="flex flex-col rounded-xl border border-border overflow-hidden">
        {items.slice(0, 3).map((a, idx) => (
          <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2 ${idx > 0 ? 'border-t border-border' : ''}`}>
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.hype_score >= 88 ? 'bg-error' : 'bg-warn'}`} />
            <div className="flex-1 min-w-0">
              <span className={`mr-2 text-2xs font-bold uppercase tracking-wider ${a.hype_score >= 88 ? 'text-error' : 'text-warn'}`}>
                {a.hype_score >= 88 ? 'Urgent' : 'Alerte'}
              </span>
              <span className="text-sm text-text-2">{a.title}</span>
            </div>
            <span className="shrink-0 text-xs text-text-3">{timeAgo(a.published_at)}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
