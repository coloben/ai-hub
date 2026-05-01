'use client'

import { useState } from 'react'
import { generateAlertEvents, defaultWatchlistRules, AlertEvent, AlertPriority, AlertType, WatchlistRule } from '@/lib/alerts'

const priorityConfig: Record<AlertPriority, { label: string; cls: string; dot: string }> = {
  critical: { label: 'Critique',  cls: 'bg-red-500/10 text-red-400 border-red-500/20',     dot: 'bg-red-400' },
  high:     { label: 'Élevée',    cls: 'bg-amber/10 text-amber border-amber/20',            dot: 'bg-amber' },
  medium:   { label: 'Moyenne',   cls: 'bg-primary/10 text-primary border-primary/20',      dot: 'bg-primary' },
  low:      { label: 'Faible',    cls: 'bg-white/[0.05] text-text-muted border-white/10',   dot: 'bg-text-faint' },
}

const typeLabels: Record<AlertType, string> = {
  new_leader:        '👑 Nouveau leader',
  price_drop:        '💸 Baisse de prix',
  new_benchmark:     '📊 Benchmark',
  new_open_model:    '🔓 Modèle open-source',
  elo_change:        '📈 Changement ELO',
  security_incident: '🔴 Incident sécurité',
}

function formatTimeAgo(date: string): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 5) return 'maintenant'
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

export default function AlertsPage() {
  const [rules, setRules] = useState<WatchlistRule[]>(defaultWatchlistRules)
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all')
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all')

  const events = generateAlertEvents(rules)

  const filtered = events.filter(e => {
    if (filterPriority !== 'all' && e.priority !== filterPriority) return false
    if (filterType !== 'all' && e.type !== filterType) return false
    return true
  })

  const criticalCount = events.filter(e => e.priority === 'critical').length
  const highCount     = events.filter(e => e.priority === 'high').length

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  return (
    <div className="relative flex overflow-hidden">
      <span className="mesh-orb right-[5%] top-[5%] h-56 w-56 bg-red-500/10"></span>
      <span className="mesh-orb left-[40%] top-[30%] h-48 w-48 bg-amber/10"></span>
      <div className="flex-1 px-6 py-6 2xl:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-[-0.05em]">Alertes &amp; Watchlist</h1>
            <p className="mt-1 text-sm text-text-muted">Surveillance en temps réel de l&apos;écosystème IA — leaders, prix, benchmarks, incidents.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Alertes totales',  value: events.length,  cls: 'text-text' },
              { label: 'Critiques',        value: criticalCount,  cls: 'text-red-400' },
              { label: 'Élevées',          value: highCount,      cls: 'text-amber' },
              { label: 'Règles actives',   value: rules.filter(r => r.enabled).length, cls: 'text-success' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="intel-card rounded-2xl p-4">
                <div className="text-2xs uppercase tracking-[0.2em] text-text-faint">{label}</div>
                <div className={`mt-2 text-2xl font-semibold ${cls}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xs uppercase tracking-[0.2em] text-text-faint">Priorité :</span>
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className={`rounded-full border px-3 py-1 text-2xs transition-colors ${filterPriority === p ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-text-muted hover:text-text'}`}>
                    {p === 'all' ? 'Toutes' : priorityConfig[p].label}
                  </button>
                ))}
                <span className="ml-4 text-2xs uppercase tracking-[0.2em] text-text-faint">Type :</span>
                {(['all', ...Object.keys(typeLabels)] as const).map(t => (
                  <button key={t} onClick={() => setFilterType(t as AlertType | 'all')}
                    className={`rounded-full border px-3 py-1 text-2xs transition-colors ${filterType === t ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-text-muted hover:text-text'}`}>
                    {t === 'all' ? 'Tous' : typeLabels[t as AlertType]}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="intel-card rounded-2xl p-8 text-center text-text-muted">
                  Aucune alerte pour les filtres sélectionnés.
                </div>
              )}

              <div className="space-y-3">
                {filtered.map((event: AlertEvent) => {
                  const p = priorityConfig[event.priority]
                  return (
                    <div key={event.id} className="intel-card rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${p.dot} ${event.priority === 'critical' ? 'animate-pulse' : ''}`}></span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2 py-0.5 text-2xs font-medium ${p.cls}`}>{p.label}</span>
                            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-2xs text-text-muted">{typeLabels[event.type]}</span>
                            <span className="ml-auto font-mono text-2xs text-text-faint">{formatTimeAgo(event.created_at)}</span>
                          </div>
                          <h3 className="text-sm font-semibold leading-5">{event.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-text-muted">{event.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-2xs text-text-faint">Action :</span>
                            <span className="text-2xs text-primary">{event.action}</span>
                            {event.related_url && (
                              <a href={event.related_url} target="_blank" rel="noopener noreferrer"
                                className="ml-auto text-2xs text-text-muted underline underline-offset-2 hover:text-text">
                                Voir →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="intel-card rounded-[24px] p-5">
                <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-text-muted">Règles de surveillance</h3>
                <div className="space-y-3">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium">{rule.label}</div>
                        {rule.threshold && (
                          <div className="text-2xs text-text-faint">Seuil : {rule.threshold}%</div>
                        )}
                      </div>
                      <button onClick={() => toggleRule(rule.id)}
                        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${rule.enabled ? 'bg-primary' : 'bg-white/10'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-2xs text-text-faint">Les règles sont sauvegardées en session. Connectez une DB pour les persister.</p>
              </div>

              <div className="intel-card rounded-[24px] p-5">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-text-muted">Légende</h3>
                <div className="space-y-2">
                  {(Object.entries(priorityConfig) as [AlertPriority, typeof priorityConfig[AlertPriority]][]).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`}></span>
                      <span className="text-2xs text-text-muted">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
