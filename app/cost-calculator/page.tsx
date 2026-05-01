'use client'

import { useState, useMemo } from 'react'
import { mockModels } from '@/lib/mock-data'
import { InfoTooltip } from '@/components/InfoTooltip'

export default function CostCalculatorPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt5')
  const [inputTokens, setInputTokens] = useState(1000000)
  const [outputTokens, setOutputTokens] = useState(500000)
  const [requestsPerDay, setRequestsPerDay] = useState(100)

  const selectedModel = mockModels.find(m => m.id === selectedModelId)
  
  const cost = useMemo(() => {
    if (!selectedModel) return { perRequest: 0, daily: 0, monthly: 0 }
    const inputCost = (selectedModel.scores.price_input ?? 0) * (inputTokens / 1000000)
    const outputCost = (selectedModel.scores.price_output ?? 0) * (outputTokens / 1000000)
    const perRequest = inputCost + outputCost
    const daily = perRequest * requestsPerDay
    const monthly = daily * 30
    return { perRequest, daily, monthly }
  }, [selectedModel, inputTokens, outputTokens, requestsPerDay])

  const apiModels = mockModels.filter(m => m.api_available && m.scores.price_input)

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-semibold">Calculateur de coûts API</h1>
          <InfoTooltip term="Prix d'API" />
        </div>
        <p className="text-sm text-text-muted mb-6">
          Estimez le coût d&apos;utilisation d&apos;un modèle via API en fonction de votre volume de tokens.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-4">
            <div className="bg-surface-2 rounded-lg p-5 border border-border">
              <h3 className="text-sm font-medium mb-4">Modèle</h3>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text"
              >
                {apiModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} — ${model.scores.price_input}/${model.scores.price_output} par 1M tokens
                  </option>
                ))}
              </select>
              {selectedModel && (
                <div className="mt-3 text-2xs text-text-faint">
                  {selectedModel.description}
                </div>
              )}
            </div>

            <div className="bg-surface-2 rounded-lg p-5 border border-border">
              <h3 className="text-sm font-medium mb-4">Volume</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-2xs text-text-muted uppercase tracking-wider flex items-center gap-1 mb-1">
                    Tokens d&apos;entrée par requête <InfoTooltip term="Prix d'API" size="sm" />
                  </label>
                  <input
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text font-mono"
                  />
                  <div className="text-2xs text-text-faint mt-1">≈ {(inputTokens * 0.75 / 1000).toFixed(0)}k mots</div>
                </div>

                <div>
                  <label className="text-2xs text-text-muted uppercase tracking-wider mb-1 block">
                    Tokens de sortie par requête
                  </label>
                  <input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text font-mono"
                  />
                  <div className="text-2xs text-text-faint mt-1">≈ {(outputTokens * 0.75 / 1000).toFixed(0)}k mots</div>
                </div>

                <div>
                  <label className="text-2xs text-text-muted uppercase tracking-wider mb-1 block">
                    Requêtes par jour
                  </label>
                  <input
                    type="number"
                    value={requestsPerDay}
                    onChange={(e) => setRequestsPerDay(Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            <div className="bg-surface-2 rounded-lg p-5 border border-primary/20">
              <h3 className="text-sm font-medium text-primary mb-4">Estimation</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xs text-text-muted uppercase tracking-wider">Coût par requête</div>
                  <div className="text-2xl font-bold text-primary">${cost.perRequest.toFixed(4)}$</div>
                </div>
                <div>
                  <div className="text-2xs text-text-muted uppercase tracking-wider">Coût par jour</div>
                  <div className="text-xl font-bold">{cost.daily.toFixed(2)}$</div>
                </div>
                <div>
                  <div className="text-2xs text-text-muted uppercase tracking-wider">Coût par mois (30j)</div>
                  <div className="text-3xl font-bold text-amber">{cost.monthly.toFixed(2)}$</div>
                </div>
              </div>
            </div>

            <div className="bg-surface-2 rounded-lg p-5 border border-border">
              <h3 className="text-sm font-medium mb-4">Comparaison rapide</h3>
              <div className="space-y-2">
                {apiModels.map(model => {
                  const mInputCost = (model.scores.price_input ?? 0) * (inputTokens / 1000000)
                  const mOutputCost = (model.scores.price_output ?? 0) * (outputTokens / 1000000)
                  const mMonthly = (mInputCost + mOutputCost) * requestsPerDay * 30
                  return (
                    <div key={model.id} className="flex items-center justify-between text-sm">
                      <span className={model.id === selectedModelId ? 'text-primary font-medium' : 'text-text-muted'}>
                        {model.name}
                      </span>
                      <span className="font-mono">{mMonthly.toFixed(2)}$/mois</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
