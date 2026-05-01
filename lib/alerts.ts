import { mockModels, mockNews } from './mock-data'
import { enrichNews } from './intelligence'
import { snapshotModelHistory } from './ingestion'

export type AlertType = 'new_leader' | 'price_drop' | 'new_benchmark' | 'new_open_model' | 'elo_change' | 'security_incident'
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low'

export interface WatchlistRule {
  id: string
  label: string
  type: AlertType
  enabled: boolean
  threshold?: number
  targets?: string[]
}

export interface AlertEvent {
  id: string
  type: AlertType
  priority: AlertPriority
  title: string
  description: string
  action: string
  created_at: string
  related_url?: string
}

export const defaultWatchlistRules: WatchlistRule[] = [
  { id: 'leader-change', label: 'Nouveau leader mondial', type: 'new_leader', enabled: true },
  { id: 'api-price-drop', label: 'Baisse prix API', type: 'price_drop', enabled: true, threshold: 15 },
  { id: 'benchmark-detected', label: 'Nouveau benchmark', type: 'new_benchmark', enabled: true },
  { id: 'open-model', label: 'Nouveau modèle open-source', type: 'new_open_model', enabled: true },
  { id: 'elo-move', label: 'Changement ELO important', type: 'elo_change', enabled: true, threshold: 25 },
  { id: 'security', label: 'Incident sécurité / fail', type: 'security_incident', enabled: true },
]

function priorityFromScore(score: number): AlertPriority {
  if (score >= 88) return 'critical'
  if (score >= 75) return 'high'
  if (score >= 55) return 'medium'
  return 'low'
}

export function generateAlertEvents(rules = defaultWatchlistRules): AlertEvent[] {
  const enabled = new Set(rules.filter(rule => rule.enabled).map(rule => rule.type))
  const events: AlertEvent[] = []
  const ranked = snapshotModelHistory(mockModels)
  const leader = ranked[0]

  if (enabled.has('new_leader') && leader) {
    events.push({
      id: `new-leader-${leader.model_id}`,
      type: 'new_leader',
      priority: 'high',
      title: `${leader.model_name} mène le classement mondial`,
      description: `${leader.provider} est actuellement #1 avec ${leader.arena_elo ?? '—'} ELO.`,
      action: 'Comparer ce modèle contre vos modèles en production.',
      created_at: new Date().toISOString(),
    })
  }

  mockModels.filter(model => model.type === 'open' && model.is_new).slice(0, 3).forEach(model => {
    if (!enabled.has('new_open_model')) return
    events.push({
      id: `new-open-${model.id}`,
      type: 'new_open_model',
      priority: 'medium',
      title: `Nouveau modèle open-source : ${model.name}`,
      description: `${model.provider} propose un modèle libre pour ${model.best_for?.join(', ') ?? model.subcategory_label}.`,
      action: 'Évaluer self-hosting, licence, coût infra et qualité réelle.',
      created_at: new Date().toISOString(),
      related_url: model.changelog_url,
    })
  })

  mockModels.filter(model => model.rank_delta_7d >= 20).forEach(model => {
    if (!enabled.has('elo_change')) return
    events.push({
      id: `elo-change-${model.id}`,
      type: 'elo_change',
      priority: priorityFromScore(70 + model.rank_delta_7d),
      title: `${model.name} progresse fortement`,
      description: `Variation 7 jours : +${model.rank_delta_7d}. Ce mouvement peut changer les recommandations.`,
      action: 'Inspecter les nouveaux benchmarks et cas d’usage gagnants.',
      created_at: new Date().toISOString(),
      related_url: model.changelog_url,
    })
  })

  mockNews.map(enrichNews).forEach(signal => {
    if (enabled.has('new_benchmark') && signal.signalType === 'benchmark') {
      events.push({
        id: `benchmark-${signal.news.id}`,
        type: 'new_benchmark',
        priority: priorityFromScore(signal.impact),
        title: signal.news.title,
        description: signal.whyItMatters,
        action: signal.action,
        created_at: signal.news.published_at,
        related_url: signal.news.url,
      })
    }

    const text = `${signal.news.title} ${signal.news.summary} ${signal.news.tags.join(' ')}`.toLowerCase()
    if (enabled.has('security_incident') && ['security', 'fail', 'incident', 'jailbreak', 'leak', 'fuite'].some(keyword => text.includes(keyword))) {
      events.push({
        id: `security-${signal.news.id}`,
        type: 'security_incident',
        priority: 'critical',
        title: signal.news.title,
        description: 'Signal sécurité détecté dans le flux IA.',
        action: 'Vérifier exposition, vendors concernés et mitigation.',
        created_at: signal.news.published_at,
        related_url: signal.news.url,
      })
    }
  })

  return events.sort((a, b) => {
    const rank: Record<AlertPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return rank[b.priority] - rank[a.priority]
  })
}
