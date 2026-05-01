'use client'

import { useMemo } from 'react'
import { mockModels } from '@/lib/mock-data'

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    'Anthropic': '#9f1239',
    'OpenAI': '#10a37f',
    'Google': '#4285f4',
    'Meta': '#0668e1',
    'Mistral': '#fd5c63',
    'xAI': '#1d9bf0',
    'Cohere': '#d18e64',
    'Alibaba': '#ff6a00',
    'DeepSeek': '#4d6bfa',
    'Microsoft': '#00a4ef',
  }
  return colors[provider] || '#6366f1'
}

function getQuarter(date: string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const quarter = Math.floor(d.getMonth() / 3) + 1
  return `${year}-Q${quarter}`
}

export default function TimelinePage() {
  const groupedModels = useMemo(() => {
    const grouped: Record<string, typeof mockModels> = {}
    
    mockModels.forEach(model => {
      const quarter = getQuarter(model.release_date)
      if (!grouped[quarter]) {
        grouped[quarter] = []
      }
      grouped[quarter].push(model)
    })
    
    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([quarter, models]) => ({
        quarter,
        models: models.sort((a, b) => 
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        ),
      }))
  }, [])

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold mb-6">Chronologie des sorties</h1>
        
        <div className="space-y-8">
          {groupedModels.map(({ quarter, models }) => (
            <div key={quarter} className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 text-right">
                  <span className="text-sm font-mono text-text-muted">{quarter}</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="flex-1 h-px bg-divider"></div>
              </div>
              
              <div className="ml-[92px] space-y-3">
                {models.map((model) => (
                  <div 
                    key={model.id}
                    className="bg-surface-2 rounded p-4 hover:bg-surface-offset transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${getProviderColor(model.provider)}20`, color: getProviderColor(model.provider) }}
                      >
                        {model.provider.slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{model.name}</h3>
                          {model.is_new && (
                            <span className="px-1.5 py-0.5 bg-primary-dim text-new-badge text-2xs rounded">
                              NOUV.
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-2xs text-text-muted mb-2">
                          <span>{model.provider}</span>
                          <span>•</span>
                          <span className="font-mono">{model.release_date}</span>
                          <span>•</span>
                          <span>{model.type === 'open' ? 'Libre' : 'Propriétaire'}</span>
                        </div>
                        
                        {model.description && (
                          <p className="text-xs text-text-muted mb-3">{model.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="font-mono">
                            ELO : {model.scores.arena_elo ?? '—'}
                          </span>
                          <span className="font-mono">
                            MMLU : {model.scores.mmlu ? `${model.scores.mmlu}%` : '—'}
                          </span>
                          <span className="font-mono">
                            Contexte : {(model.context_window / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                      
                      <a 
                        href={model.changelog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                      >
                        Détails →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
          <div className="text-xs text-text-muted">Fournisseurs :</div>
          {Array.from(new Set(mockModels.map(m => m.provider))).map(provider => (
            <div key={provider} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getProviderColor(provider) }}
              ></div>
              <span className="text-xs text-text-muted">{provider}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
