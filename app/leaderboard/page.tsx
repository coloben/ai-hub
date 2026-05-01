'use client'

import { useState, useMemo } from 'react'
import { mockModels } from '@/lib/mock-data'
import { Model } from '@/lib/types'

type SortField = 'arena_elo' | 'mmlu' | 'humaneval' | 'math' | 'gpqa' | 'speed_tps' | 'price_input' | 'release_date'
type ScoreField = Exclude<SortField, 'release_date'>
type FilterType = 'all' | 'proprietary' | 'open'

const sortLabels: Record<SortField, string> = {
  arena_elo: 'Arena ELO',
  mmlu: 'MMLU',
  humaneval: 'HumanEval',
  math: 'MATH',
  gpqa: 'GPQA',
  speed_tps: 'Vitesse',
  price_input: '$/1M entrée',
  release_date: 'Sortie',
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    'Anthropic': 'text-[#9f1239]',
    'OpenAI': 'text-[#10a37f]',
    'Google': 'text-[#4285f4]',
    'Meta': 'text-[#0668e1]',
    'Mistral': 'text-[#fd5c63]',
    'xAI': 'text-[#1d9bf0]',
    'Cohere': 'text-[#d18e64]',
    'Alibaba': 'text-[#ff6a00]',
    'DeepSeek': 'text-[#4d6bfa]',
    'Microsoft': 'text-[#00a4ef]',
  }
  return colors[provider] || 'text-primary'
}

function formatScore(score: number | null): string {
  if (score === null || score === undefined) return '—'
  return score.toString()
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined || price === 0) return '—'
  return `$${price}`
}

export default function LeaderboardPage() {
  const [sortField, setSortField] = useState<SortField>('arena_elo')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [pageSize, setPageSize] = useState(20)
  const [expandedModel, setExpandedModel] = useState<string | null>(null)

  const filteredModels = useMemo(() => {
    let filtered = [...mockModels]
    
    if (filterType === 'proprietary') {
      filtered = filtered.filter(m => m.type === 'proprietary')
    } else if (filterType === 'open') {
      filtered = filtered.filter(m => m.type === 'open')
    }

    filtered.sort((a, b) => {
      const aVal = sortField === 'release_date' ? a.release_date : (a.scores[sortField as ScoreField] ?? (sortField === 'price_input' ? Infinity : 0))
      const bVal = sortField === 'release_date' ? b.release_date : (b.scores[sortField as ScoreField] ?? (sortField === 'price_input' ? Infinity : 0))
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    return filtered
  }, [filterType, sortField, sortDirection])

  const displayModels = filteredModels.slice(0, pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const exportCSV = () => {
    const headers = ['Rank', 'Model', 'Provider', 'Type', 'Arena ELO', 'MMLU', 'HumanEval', 'MATH', 'GPQA', 'Speed', 'Price In', 'Price Out', 'Released']
    const rows = filteredModels.map((m, i) => [
      i + 1,
      m.name,
      m.provider,
      m.type,
      m.scores.arena_elo ?? '',
      m.scores.mmlu ?? '',
      m.scores.humaneval ?? '',
      m.scores.math ?? '',
      m.scores.gpqa ?? '',
      m.scores.speed_tps ?? '',
      m.scores.price_input ?? '',
      m.scores.price_output ?? '',
      m.release_date,
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'ai-models-leaderboard.csv'
    link.click()
  }

  const maxScores = useMemo(() => {
    const max: Record<string, number> = {}
    ;['arena_elo', 'mmlu', 'humaneval', 'math', 'gpqa'].forEach(field => {
      max[field] = Math.max(...filteredModels.map(m => m.scores[field as keyof typeof m.scores] ?? 0))
    })
    return max
  }, [filteredModels])

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Classement des modèles</h1>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-surface-2 hover:bg-surface-offset rounded text-sm text-text-muted hover:text-text transition-colors"
          >
            Exporter CSV
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-surface-2 rounded p-1">
            {(['all', 'proprietary', 'open'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterType === type
                    ? 'bg-surface text-text'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {type === 'all' ? 'Tous' : type === 'proprietary' ? 'Propriétaire' : 'Libre'}
              </button>
            ))}
          </div>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-surface-2 border border-border rounded px-3 py-1.5 text-sm text-text"
          >
            <option value={10}>10 par page</option>
            <option value={20}>20 par page</option>
            <option value={50}>50 par page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider w-12">Rang</th>
                <th className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider">Modèle</th>
                <th className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider">Fournisseur</th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('arena_elo')}
                >
                  Arena ELO {sortField === 'arena_elo' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('mmlu')}
                >
                  MMLU {sortField === 'mmlu' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('humaneval')}
                >
                  HumanEval {sortField === 'humaneval' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('math')}
                >
                  MATH {sortField === 'math' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('gpqa')}
                >
                  GPQA {sortField === 'gpqa' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('speed_tps')}
                >
                  Vitesse {sortField === 'speed_tps' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text"
                  onClick={() => handleSort('price_input')}
                >
                  $/1M entrée {sortField === 'price_input' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th className="text-left py-3 px-2 text-2xs font-medium text-text-muted uppercase tracking-wider">Sortie</th>
              </tr>
            </thead>
            <tbody>
              {displayModels.map((model, index) => (
                <>
                  <tr 
                    key={model.id}
                    className={`border-b border-divider hover:bg-surface-2 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-surface' : 'bg-[#141417]'
                    }`}
                    onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                  >
                    <td className="py-3 px-2">
                      <span className={`text-sm font-mono ${
                        index < 3 ? 'text-primary font-medium' : 'text-text-muted'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{model.name}</span>
                        {model.is_new && (
                          <span className="px-1 py-0.5 bg-primary-dim text-new-badge text-2xs rounded">NOUV.</span>
                        )}
                      </div>
                    </td>
                    <td className={`py-3 px-2 text-sm ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums">
                      <span className={model.scores.arena_elo === maxScores.arena_elo ? 'border-b border-dotted border-primary' : ''}>
                        {formatScore(model.scores.arena_elo)}
                      </span>
                      {model.rank_delta_7d !== 0 && (
                        <span className={`ml-2 text-2xs ${model.rank_delta_7d > 0 ? 'text-success' : 'text-error'}`}>
                          {model.rank_delta_7d > 0 ? '▲' : '▼'} {Math.abs(model.rank_delta_7d)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums text-text-muted">
                      <span className={model.scores.mmlu === maxScores.mmlu ? 'text-text border-b border-dotted border-primary' : ''}>
                        {formatScore(model.scores.mmlu)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums text-text-muted">
                      <span className={model.scores.humaneval === maxScores.humaneval ? 'text-text border-b border-dotted border-primary' : ''}>
                        {formatScore(model.scores.humaneval)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums text-text-muted">
                      <span className={model.scores.math === maxScores.math ? 'text-text border-b border-dotted border-primary' : ''}>
                        {formatScore(model.scores.math)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums text-text-muted">
                      <span className={model.scores.gpqa === maxScores.gpqa ? 'text-text border-b border-dotted border-primary' : ''}>
                        {formatScore(model.scores.gpqa)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums text-text-muted">
                      {formatScore(model.scores.speed_tps)}
                    </td>
                    <td className="py-3 px-2 font-mono text-sm tabular-nums text-text-muted">
                      {formatPrice(model.scores.price_input)}
                    </td>
                    <td className="py-3 px-2 text-sm text-text-muted font-mono">
                      {model.release_date}
                    </td>
                  </tr>
                  {expandedModel === model.id && (
                    <tr className="bg-surface-2">
                      <td colSpan={11} className="py-4 px-6">
                        <div className="text-sm text-text-muted">
                          <p className="mb-2">{model.description}</p>
                          <div className="flex items-center gap-4 text-2xs">
                            <span>Contexte : {model.context_window.toLocaleString()} tokens</span>
                            <span>Type : {model.type}</span>
                            <a 
                              href={model.changelog_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Journal →
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {displayModels.length < filteredModels.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPageSize(prev => prev + 20)}
              className="px-6 py-2 bg-surface-2 hover:bg-surface-offset rounded text-sm text-text-muted hover:text-text transition-colors"
            >
              Charger plus ({filteredModels.length - displayModels.length} restants)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
