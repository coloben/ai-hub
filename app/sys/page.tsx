'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLiveStatus, runScheduledIngestion, ScheduleMode } from '@/lib/scheduler'
import { enhancedSourceConnectors, EnhancedSourceConnector } from '@/lib/sources-v2'

const ACCESS_KEY = 'Kloups94!'

export default function SysPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [status, setStatus] = useState(getLiveStatus())
  const [logs, setLogs] = useState<string[]>([])

  const handleUnlock = () => {
    if (input === ACCESS_KEY) {
      setIsUnlocked(true)
      addLog('Session autorisée')
    } else {
      addLog('Refusé')
      setInput('')
    }
  }

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50))
  }

  const handleRefresh = () => {
    setStatus(getLiveStatus())
    addLog('Status refresh')
  }

  const handleTrigger = async (mode: ScheduleMode) => {
    addLog(`Trigger ${mode}...`)
    try {
      const result = await runScheduledIngestion(mode)
      addLog(`OK: ${result.items_ingested} items`)
    } catch (e) {
      addLog(`Erreur: ${e}`)
    }
  }

  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
              <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Saisissez votre clé..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-primary/50 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleUnlock}
              className="w-full rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/20"
            >
              Continuer
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-text-faint">
            Système de monitoring interne
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text">Panel Système</h1>
            <p className="text-sm text-text-muted">Monitoring et contrôle infrastructure</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-muted transition-colors hover:bg-white/5"
          >
            Retour
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-2xs uppercase tracking-wider text-text-faint">Sources actives</div>
            <div className="mt-1 text-2xl font-semibold text-success">{status.healthySources}/{status.totalSources}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-2xs uppercase tracking-wider text-text-faint">Dernière sync</div>
            <div className="mt-1 text-2xl font-semibold text-primary">{status.syncAgoMinutes}m</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-2xs uppercase tracking-wider text-text-faint">Circuit breakers</div>
            <div className="mt-1 text-2xl font-semibold text-amber">{status.circuitBreakersOpen}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-2xs uppercase tracking-wider text-text-faint">Prochaine sync</div>
            <div className="mt-1 text-2xl font-semibold text-text">~{status.nextSyncInMinutes}m</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="mb-4 text-sm font-medium text-text">Actions manuelles</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTrigger('fast')}
              className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success transition-all hover:bg-success/20"
            >
              ⚡ Fast (15 sources)
            </button>
            <button
              onClick={() => handleTrigger('full')}
              className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20"
            >
              🔍 Full (toutes)
            </button>
            <button
              onClick={() => handleTrigger('daily')}
              className="rounded-lg bg-amber/10 px-4 py-2 text-sm font-medium text-amber transition-all hover:bg-amber/20"
            >
              📊 Daily cleanup
            </button>
            <button
              onClick={handleRefresh}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-muted transition-all hover:bg-white/5"
            >
              🔄 Refresh status
            </button>
          </div>
        </div>

        {/* Sources List */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="mb-4 text-sm font-medium text-text">État des sources ({enhancedSourceConnectors.length})</h2>
          <div className="space-y-2 max-h-64 overflow-auto">
            {enhancedSourceConnectors.map((source: EnhancedSourceConnector) => (
              <div key={source.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${source.enabled ? 'bg-success' : 'bg-red-500'}`} />
                  <span className="text-sm text-text">{source.name}</span>
                  <span className="text-2xs text-text-faint">{source.priority}</span>
                </div>
                <span className="text-2xs text-text-faint">{source.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <h2 className="mb-4 text-sm font-medium text-text">Logs temps réel</h2>
          <div className="h-48 overflow-auto rounded-lg border border-white/5 bg-black/50 p-3 font-mono text-xs">
            {logs.length === 0 ? (
              <span className="text-text-faint">En attente d'actions...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="py-0.5 text-text-muted">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
