import { Model } from './types'
import { mockModels } from './mock-data'
import { getMergedModels } from './arena-scraper'

export const revalidate = 3600

// Cache en mémoire — évite de re-fetcher à chaque requête dans la même instance
let _cache: { models: Model[]; at: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1h

export async function getLiveModels(): Promise<Model[]> {
  const now = Date.now()
  if (_cache && now - _cache.at < CACHE_TTL) return _cache.models

  try {
    const models = await getMergedModels()
    _cache = { models, at: now }
    return models
  } catch {
    return mockModels
  }
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
