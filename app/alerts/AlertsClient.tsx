'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'

interface Alert {
  id: string
  model_id: string
  condition: string
  threshold: number | null
  is_active: boolean
  last_triggered_at: string | null
  created_at: string
}

const CONDITIONS = [
  { id: 'elo_above',    label: 'ELO dépasse',       icon: '↑', hasThreshold: true },
  { id: 'elo_below',    label: 'ELO passe sous',     icon: '↓', hasThreshold: true },
  { id: 'new_release',  label: 'Nouvelle version',   icon: '🚀', hasThreshold: false },
  { id: 'price_drop',   label: 'Baisse de prix',     icon: '💸', hasThreshold: true },
]

function conditionLabel(condition: string, threshold: number | null): string {
  const c = CONDITIONS.find(c => c.id === condition)
  if (!c) return condition
  return threshold != null ? `${c.label} ${threshold}` : c.label
}

function timeAgo(date: string): string {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (m < 2) return 'à l\'instant'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

export default function AlertsClient() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  // Form state
  const [modelId, setModelId] = useState(mockModels[0]?.id ?? '')
  const [condition, setCondition] = useState('elo_above')
  const [threshold, setThreshold] = useState<string>('1300')
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => {
        if (r.status === 401) { setLoggedIn(false); setLoading(false); return null }
        setLoggedIn(true)
        return r.json()
      })
      .then(d => {
        if (d) setAlerts(d.alerts ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function addAlert(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setAdding(true)

    const cond = CONDITIONS.find(c => c.id === condition)
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: modelId,
        condition,
        threshold: cond?.hasThreshold ? parseFloat(threshold) : null,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error); setAdding(false); return }
    setAlerts(prev => [data.alert, ...prev])
    setAdding(false)
  }

  async function toggleAlert(id: string, current: boolean) {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    if (res.ok) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))
    }
  }

  async function deleteAlert(id: string) {
    const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
    if (res.ok) setAlerts(prev => prev.filter(a => a.id !== id))
  }

  if (loggedIn === false) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔔</p>
          <h2 className="text-xl font-bold text-text mb-2">Alertes personnalisées</h2>
          <p className="text-sm text-text-2 mb-6">Connectez-vous pour surveiller vos modèles favoris.</p>
          <Link href="/login?redirect=/alerts"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  const activeCount = alerts.filter(a => a.is_active).length
  const triggeredCount = alerts.filter(a => a.last_triggered_at).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16 md:px-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Alertes & Watchlist</h1>
        <p className="mt-1 text-sm text-text-2">Recevez une notification quand vos modèles bougent.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Alertes', value: alerts.length, color: 'text-text' },
          { label: 'Actives', value: activeCount, color: 'text-success' },
          { label: 'Déclenchées', value: triggeredCount, color: 'text-warn' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-2xs text-text-3 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire création */}
      <form onSubmit={addAlert} className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h2 className="mb-4 text-sm font-semibold text-text">Nouvelle alerte</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Modèle */}
          <div>
            <label className="mb-1 block text-2xs font-semibold text-text-3 uppercase tracking-wide">Modèle</label>
            <select
              value={modelId}
              onChange={e => setModelId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary/40"
            >
              {mockModels
                .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
                .map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="mb-1 block text-2xs font-semibold text-text-3 uppercase tracking-wide">Condition</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary/40"
            >
              {CONDITIONS.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Seuil */}
          <div>
            <label className="mb-1 block text-2xs font-semibold text-text-3 uppercase tracking-wide">
              Seuil {!CONDITIONS.find(c => c.id === condition)?.hasThreshold && '(N/A)'}
            </label>
            <input
              type="number"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              disabled={!CONDITIONS.find(c => c.id === condition)?.hasThreshold}
              placeholder="ex: 1300"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary/40 disabled:opacity-40"
            />
          </div>
        </div>

        {formError && <p className="mt-2 text-xs text-error">{formError}</p>}

        <button
          type="submit"
          disabled={adding}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {adding ? 'Création…' : '+ Créer l\'alerte'}
        </button>
      </form>

      {/* Liste alertes */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="text-4xl mb-3">🔕</p>
          <p className="text-sm font-semibold text-text">Aucune alerte</p>
          <p className="text-xs text-text-3 mt-1">Créez votre première alerte ci-dessus</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(alert => {
            const model = mockModels.find(m => m.id === alert.model_id)
            return (
              <div key={alert.id} className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-all ${
                alert.is_active ? 'border-border bg-surface' : 'border-border/50 bg-surface opacity-60'
              }`}>
                {/* Status dot */}
                <span className={`h-2 w-2 shrink-0 rounded-full ${alert.is_active ? 'bg-success live-pulse' : 'bg-text-3'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-text">{model?.name ?? alert.model_id}</span>
                    <span className="rounded bg-surface-2 border border-border px-1.5 py-0.5 text-2xs text-text-3">
                      {conditionLabel(alert.condition, alert.threshold)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-2xs text-text-3">
                    <span>Créée {timeAgo(alert.created_at)}</span>
                    {alert.last_triggered_at && (
                      <span className="text-warn">⚡ Déclenchée {timeAgo(alert.last_triggered_at)}</span>
                    )}
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${alert.is_active ? 'bg-primary' : 'bg-border'}`}
                  aria-label="Activer/désactiver"
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${alert.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="shrink-0 text-text-3 hover:text-error transition-colors"
                  aria-label="Supprimer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
