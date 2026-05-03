'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockModels, subcategoryConfig } from '@/lib/mock-data'
import { InfoTooltip } from '@/components/InfoTooltip'
import { getAllRecommendations, UseCaseRecommendation, UseCase } from '@/lib/decision'

type Tab = 'decision' | 'compare'

const useCaseColors: Record<UseCase, string> = {
  code:       '#7c3aed',
  agent:      '#0ea5e9',
  value:      '#10b981',
  enterprise: '#f59e0b',
  local:      '#6366f1',
  multimodal: '#ec4899',
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }}></div>
    </div>
  )
}

function DecisionCard({ rec }: { rec: UseCaseRecommendation }) {
  const [expanded, setExpanded] = useState(false)
  const color = useCaseColors[rec.useCase.id]
  const winner = rec.winner

  return (
    <div className="intel-card rounded-[24px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xl">{rec.useCase.icon}</span>
            <span className="text-sm font-semibold" style={{ color }}>{rec.useCase.label}</span>
          </div>
          <p className="text-2xs text-text-faint">{rec.useCase.description}</p>
        </div>
        <div className="flex-shrink-0 rounded-xl border px-3 py-1 text-center" style={{ borderColor: `${color}30`, background: `${color}10` }}>
          <div className="font-mono text-lg font-bold" style={{ color }}>{winner.finalScore}</div>
          <div className="text-2xs text-text-faint">/100</div>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold">{winner.model.name}</span>
          <span className="text-2xs text-text-faint">{winner.model.provider}</span>
        </div>
        <p className="mb-2 text-2xs leading-5 text-text-muted">{winner.verdict}</p>
        <ScoreBar score={winner.finalScore} color={color} />
        {winner.caveat && (
          <p className="mt-2 text-2xs text-amber">⚠ {winner.caveat}</p>
        )}
      </div>

      <p className="mb-3 text-2xs leading-5 text-text-faint">{rec.explanation}</p>

      <div className="mb-3 flex flex-wrap gap-1">
        {rec.useCase.criteria.map(c => (
          <span key={c} className="rounded-full bg-white/[0.05] px-2 py-0.5 text-2xs text-text-faint">{c}</span>
        ))}
      </div>

      <button onClick={() => setExpanded(e => !e)} className="text-2xs text-primary hover:underline">
        {expanded ? 'Masquer' : 'Voir les alternatives'} ({rec.runners.length})
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {rec.runners.map(runner => (
            <div key={runner.model.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-2xs font-medium">{runner.model.name}</span>
                  <span className="ml-2 font-mono text-2xs text-text-faint">{runner.finalScore}/100</span>
                </div>
                <ScoreBar score={runner.finalScore} color={color} />
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(winner.breakdown).length > 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-2 text-2xs uppercase tracking-[0.16em] text-text-faint">Détail du score</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(winner.breakdown).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-2xs text-text-faint">{k}</span>
                <span className="font-mono text-2xs" style={{ color }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompareClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('decision')
  const maxCompare = 4
  const recommendations = getAllRecommendations()

  const initialIds = searchParams.get('m')?.split(',').filter(id => mockModels.some(m => m.id === id)) ?? []
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (selectedIds.length > 0) params.set('m', selectedIds.join(','))
    else params.delete('m')
    const newUrl = `${window.location.pathname}${selectedIds.length > 0 ? '?' + params.toString() : ''}`
    router.replace(newUrl, { scroll: false })
  }, [selectedIds])

  const toggleModel = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= maxCompare) return prev
      return [...prev, id]
    })
  }

  const selectedModels = selectedIds.map(id => mockModels.find(m => m.id === id)!).filter(Boolean)

  const scoreFields = [
    { key: 'arena_elo',    label: 'Arena ELO',   tooltip: 'Arena ELO' },
    { key: 'mmlu',         label: 'MMLU',         tooltip: 'MMLU' },
    { key: 'humaneval',    label: 'HumanEval',    tooltip: 'HumanEval' },
    { key: 'math',         label: 'MATH',         tooltip: 'MATH' },
    { key: 'gpqa',         label: 'GPQA',         tooltip: 'GPQA' },
    { key: 'speed_tps',    label: 'Vitesse (TPS)', tooltip: 'Tokens par seconde (TPS)' },
    { key: 'price_input',  label: '$/1M entrée',  tooltip: "Prix d'API" },
    { key: 'price_output', label: '$/1M sortie',  tooltip: "Prix d'API" },
  ] as const

  return (
    <div className="relative flex overflow-hidden">
      <span className="mesh-orb right-[6%] top-[6%] h-56 w-56 bg-primary/15"></span>
      <span className="mesh-orb left-[38%] top-[35%] h-48 w-48 bg-cyan-500/10"></span>
      <div className="flex-1 px-6 py-6 2xl:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.05em]">Comparer &amp; Décider</h1>
              <p className="mt-1 text-sm text-text-muted">Choisissez le meilleur modèle selon votre cas d&apos;usage, avec score transparent.</p>
            </div>
            {selectedIds.length >= 2 && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/compare?m=${selectedIds.join(',')}`
                  navigator.clipboard?.writeText(url)
                    .then(() => alert('Lien copié !'))
                    .catch(() => alert(url))
                }}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors shrink-0"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.684a3 3 0 10-2.684-5.368M8.684 13.342L15.316 9.658" />
                </svg>
                Partager la comparaison
              </button>
            )}
          </div>

          <div className="mb-6 flex gap-2">
            <button onClick={() => setTab('decision')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'decision' ? 'bg-primary text-bg' : 'border border-white/10 text-text-muted hover:text-text'}`}>
              Decision Engine
            </button>
            <button onClick={() => setTab('compare')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'compare' ? 'bg-primary text-bg' : 'border border-white/10 text-text-muted hover:text-text'}`}>
              Comparateur manuel
            </button>
          </div>

          {tab === 'decision' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map(rec => (
                <DecisionCard key={rec.useCase.id} rec={rec} />
              ))}
            </div>
          )}

          {tab === 'compare' && (
            <div>
              <div className="mb-4">
                <h3 className="mb-3 text-sm font-medium text-text-muted">Sélectionner des modèles ({selectedIds.length}/{maxCompare})</h3>
                <div className="flex flex-wrap gap-2">
                  {mockModels.map((model) => (
                    <button key={model.id} onClick={() => toggleModel(model.id)}
                      disabled={!selectedIds.includes(model.id) && selectedIds.length >= maxCompare}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selectedIds.includes(model.id)
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-white/10 text-text-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-40'
                      }`}>
                      {model.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedModels.length > 0 ? (
                <div className="intel-card overflow-x-auto rounded-[24px] p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-2xs font-medium uppercase tracking-wider text-text-muted w-40">Métrique</th>
                        {selectedModels.map(model => (
                          <th key={model.id} className="px-4 py-3 text-center text-2xs font-medium uppercase tracking-wider" style={{ color: subcategoryConfig[model.subcategory]?.color }}>
                            {model.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Fournisseur', render: (m: typeof selectedModels[0]) => m.provider },
                        { label: 'Type', render: (m: typeof selectedModels[0]) => <span className={`rounded px-2 py-0.5 text-2xs ${m.type === 'open' ? 'bg-success/10 text-success' : 'bg-white/[0.05] text-text-muted'}`}>{m.type === 'open' ? 'Libre' : 'API'}</span> },
                        { label: 'Catégorie', render: (m: typeof selectedModels[0]) => `${subcategoryConfig[m.subcategory]?.icon} ${m.subcategory_label}` },
                        { label: 'Contexte', render: (m: typeof selectedModels[0]) => m.context_window > 0 ? `${(m.context_window / 1000).toFixed(0)}k` : '—' },
                        { label: 'Paramètres', render: (m: typeof selectedModels[0]) => m.parameters ?? '—' },
                      ].map(row => (
                        <tr key={row.label} className="border-b border-white/10">
                          <td className="px-4 py-3 text-sm text-text-muted">{row.label}</td>
                          {selectedModels.map(m => <td key={m.id} className="px-4 py-3 text-sm text-center font-mono">{row.render(m)}</td>)}
                        </tr>
                      ))}
                      {scoreFields.map(field => {
                        const values = selectedModels.map(m => m.scores[field.key as keyof typeof m.scores] as number | null)
                        const bestVal = Math.max(...values.filter((v): v is number => v !== null && v !== 0))
                        return (
                          <tr key={field.key} className="border-b border-white/10">
                            <td className="px-4 py-3 text-sm text-text-muted">
                              <span className="flex items-center gap-1">{field.label} <InfoTooltip term={field.tooltip} size="sm" /></span>
                            </td>
                            {selectedModels.map(model => {
                              const val = model.scores[field.key as keyof typeof model.scores] as number | null
                              const isBest = val !== null && val !== 0 && val === bestVal
                              return (
                                <td key={model.id} className={`px-4 py-3 text-sm text-center font-mono ${isBest ? 'text-primary font-semibold' : 'text-text-muted'}`}>
                                  {val !== null ? (field.key === 'price_input' || field.key === 'price_output' ? `$${val}` : val) : '—'}
                                  {isBest && ' ★'}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="intel-card rounded-[24px] p-12 text-center">
                  <div className="mb-3 text-4xl">⚖️</div>
                  <p className="text-sm text-text-muted">Sélectionnez au moins 2 modèles pour commencer</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
