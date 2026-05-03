/**
 * Scraper du classement LMSYS Chatbot Arena
 * Sources :
 *  1. HuggingFace dataset lmsys/chatbot_arena_conversations (scores ELO publics)
 *  2. Google Sheets public LMSYS (backup)
 *  3. Artificial Analysis (vitesse + prix)
 * Fallback : données mock-data.ts
 */

import { mockModels } from './mock-data'
import { Model } from './types'

export interface ArenaScore {
  model_name: string
  elo: number
  rank: number
  num_battles: number
  updated_at: string
}

interface HFArenaRow {
  key: string
  elo_rating: number
  num_battles?: number
}

// Mapping noms Arena → IDs dans mock-data
const ARENA_NAME_MAP: Record<string, string> = {
  'claude-4':                       'claude-4',
  'claude-opus-4':                  'claude-4',
  'gemini-2.5-pro':                 'gemini-2-5-pro',
  'gemini-2.5-pro-exp-03-25':       'gemini-2-5-pro',
  'gemini-2.5-pro-preview':         'gemini-2-5-pro',
  'gpt-4o-2024-11-20':              'gpt-4o',
  'gpt-4o':                         'gpt-4o',
  'o3':                             'o3',
  'o4-mini':                        'o4-mini',
  'claude-3-5-sonnet-20241022':     'claude-3-5-sonnet',
  'claude-3-5-sonnet':              'claude-3-5-sonnet',
  'claude-3-opus-20240229':         'claude-3-opus',
  'gemini-1.5-pro':                 'gemini-1-5-pro',
  'gemini-2.5-flash':               'gemini-2-5-flash',
  'gemini-1.5-flash':               'gemini-1-5-flash',
  'llama-4-maverick':               'llama-4-maverick',
  'meta-llama/llama-4-maverick':    'llama-4-maverick',
  'llama-4-scout':                  'llama-4-scout',
  'llama-3.1-405b':                 'llama-3-1-405b',
  'deepseek-v3':                    'deepseek-v3',
  'deepseek-r1':                    'deepseek-r1',
  'grok-3':                         'grok-3',
  'grok-3-beta':                    'grok-3',
  'grok-2':                         'grok-2',
  'mistral-large-2':                'mistral-large-2',
  'mistral-medium-3':               'mistral-medium-3',
  'qwen2.5-max':                    'qwen-2-5-max',
  'qwen2.5-72b':                    'qwen-2-5-72b',
  'glm-4-plus':                     'glm-4-plus',
  'gpt-4o-mini':                    'gpt-4o-mini',
}

async function fetchArenaFromHF(): Promise<ArenaScore[]> {
  try {
    // Endpoint HuggingFace Spaces API qui expose les scores Arena
    const res = await fetch(
      'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard/resolve/main/leaderboard_table_20240515.csv',
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`HF status ${res.status}`)
    const text = await res.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    const scores: ArenaScore[] = []
    lines.forEach((line, i) => {
      const cols = line.split(',')
      if (cols.length < 2) return
      const name = cols[0]?.replace(/"/g, '').trim().toLowerCase()
      const elo = parseInt(cols[1] ?? '0')
      if (name && elo > 800) {
        scores.push({ model_name: name, elo, rank: i + 1, num_battles: 0, updated_at: new Date().toISOString() })
      }
    })
    return scores
  } catch {
    return []
  }
}

async function fetchArenaFromAPI(): Promise<ArenaScore[]> {
  try {
    // API non-officielle mais stable utilisée par plusieurs trackers
    const res = await fetch(
      'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20241201.json',
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json() as { model_order?: string[]; elo_rating_final?: Record<string, number> }

    if (!data.elo_rating_final) return []

    const sorted = Object.entries(data.elo_rating_final)
      .sort((a, b) => b[1] - a[1])
      .map(([name, elo], i) => ({
        model_name: name.toLowerCase(),
        elo: Math.round(elo),
        rank: i + 1,
        num_battles: 0,
        updated_at: new Date().toISOString(),
      }))
    return sorted
  } catch {
    return []
  }
}

async function fetchSpeedFromArtificialAnalysis(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://artificialanalysis.ai/models', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AIHub-Tracker/1.0' },
    })
    if (!res.ok) return {}
    const html = await res.text()
    // Cherche le JSON data dans le HTML (Next.js __NEXT_DATA__)
    const match = html.match(/"throughput_tokens_per_second":(\d+).*?"model_name":"([^"]+)"/g)
    if (!match) return {}
    const map: Record<string, number> = {}
    for (const m of match) {
      const tps = m.match(/"throughput_tokens_per_second":(\d+)/)
      const name = m.match(/"model_name":"([^"]+)"/)
      if (tps && name) map[name[1].toLowerCase()] = parseInt(tps[1])
    }
    return map
  } catch {
    return {}
  }
}

export async function getArenaScores(): Promise<ArenaScore[]> {
  const [apiScores, csvScores] = await Promise.allSettled([
    fetchArenaFromAPI(),
    fetchArenaFromHF(),
  ])

  const scores = apiScores.status === 'fulfilled' && apiScores.value.length > 0
    ? apiScores.value
    : csvScores.status === 'fulfilled' ? csvScores.value : []

  return scores
}

export async function getMergedModels(): Promise<Model[]> {
  const [arenaScores, speedMap] = await Promise.allSettled([
    getArenaScores(),
    fetchSpeedFromArtificialAnalysis(),
  ])

  const scores = arenaScores.status === 'fulfilled' ? arenaScores.value : []
  const speeds = speedMap.status === 'fulfilled' ? speedMap.value : {}

  // Construire un map nom → ELO depuis Arena
  const eloMap: Record<string, number> = {}
  for (const s of scores) {
    const id = ARENA_NAME_MAP[s.model_name]
    if (id) eloMap[id] = s.elo
  }

  // Enrichir chaque modèle
  return mockModels.map(model => {
    const newElo = eloMap[model.id]
    const oldElo = model.scores.arena_elo ?? 0
    const delta7d = newElo ? Math.round(newElo - oldElo) : model.rank_delta_7d

    // Chercher vitesse depuis AA
    const speedKey = Object.keys(speeds).find(k =>
      model.name.toLowerCase().includes(k) || k.includes(model.id.toLowerCase())
    )
    const newSpeed = speedKey ? speeds[speedKey] : null

    return {
      ...model,
      scores: {
        ...model.scores,
        arena_elo: newElo ?? model.scores.arena_elo,
        speed_tps: newSpeed ?? model.scores.speed_tps,
      },
      rank_delta_7d: delta7d,
    }
  })
}
