import { Model } from './types'
import { mockModels } from './mock-data'

export const revalidate = 3600 // 1h cache

interface HFResult {
  model_name: string
  average: number
  arc: number
  hellaswag: number
  mmlu: number
  truthfulqa: number
  winogrande: number
  gsm8k: number
}

interface ArtificialAnalysisModel {
  name: string
  provider: string
  quality_index: number
  tokens_per_second: number
  output_tokens_per_dollar: number
}

async function fetchHFLeaderboard(): Promise<Partial<Record<string, Partial<Model['scores']>>>> {
  try {
    const res = await fetch(
      'https://huggingface.co/api/datasets/open-llm-leaderboard/results/parquet/default/partial_train/0000.parquet',
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return {}
    return {}
  } catch {
    return {}
  }
}

async function fetchArtificialAnalysis(): Promise<Partial<Record<string, Pick<Model['scores'], 'speed_tps' | 'price_input' | 'price_output'>>>> {
  try {
    const res = await fetch('https://artificialanalysis.ai/api/v1/models', {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'AIHub/1.0' },
    })
    if (!res.ok) return {}
    const data: ArtificialAnalysisModel[] = await res.json()
    const map: Record<string, Pick<Model['scores'], 'speed_tps' | 'price_input' | 'price_output'>> = {}
    for (const m of data) {
      if (m.tokens_per_second) {
        map[m.name.toLowerCase()] = {
          speed_tps: Math.round(m.tokens_per_second),
          price_input: null,
          price_output: null,
        }
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function getLiveModels(): Promise<Model[]> {
  const [aaData] = await Promise.allSettled([fetchArtificialAnalysis()])

  const aaMap = aaData.status === 'fulfilled' ? aaData.value : {}

  return mockModels.map(model => {
    const aaKey = Object.keys(aaMap).find(k => model.name.toLowerCase().includes(k) || k.includes(model.name.toLowerCase()))
    if (aaKey && aaMap[aaKey]) {
      return {
        ...model,
        scores: {
          ...model.scores,
          speed_tps: aaMap[aaKey]?.speed_tps ?? model.scores.speed_tps,
        },
      }
    }
    return model
  })
}

export function getModelById(id: string): Model | undefined {
  return mockModels.find(m => m.id === id)
}

export function searchModels(query: string): Model[] {
  const q = query.toLowerCase()
  return mockModels.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.provider.toLowerCase().includes(q) ||
    m.description?.toLowerCase().includes(q) ||
    m.best_for?.some(b => b.toLowerCase().includes(q))
  )
}

export function getTopModelsByField(field: keyof Model['scores'], limit = 5): Model[] {
  return [...mockModels]
    .filter(m => m.scores[field] !== null)
    .sort((a, b) => (b.scores[field] ?? 0) - (a.scores[field] ?? 0))
    .slice(0, limit)
}

export function getNewModels(): Model[] {
  return mockModels.filter(m => m.is_new)
}

export function getProviderStats(): Record<string, number> {
  return mockModels.reduce((acc, m) => {
    acc[m.provider] = (acc[m.provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}
