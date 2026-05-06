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

// Mapping noms Arena → IDs dans mock-data (plausible mai 2026)
export const ARENA_NAME_MAP: Record<string, string> = {
  'gpt-5':                          'gpt-5',
  'gpt-5-2026-04-15':               'gpt-5',
  'gpt-5-mini':                     'gpt-5-mini',
  'claude-5':                       'claude-5',
  'claude-5-2026-04-10':            'claude-5',
  'claude-5-mini':                  'claude-5-mini',
  'gemini-3-pro':                   'gemini-3-pro',
  'gemini-3-pro-exp':               'gemini-3-pro',
  'gemini-3-flash':                 'gemini-3-flash',
  'gemini-3-flash-preview':         'gemini-3-flash',
  'o5':                             'o5',
  'o5-2026-03-10':                  'o5',
  'llama-5':                        'llama-5',
  'llama-5-maverick':               'llama-5',
  'meta-llama/llama-5':             'llama-5',
  'llama-5-scout':                  'llama-5-scout',
  'deepseek-v4':                    'deepseek-v4',
  'deepseek-r2':                    'deepseek-r2',
  'mistral-large-3':                'mistral-large-3',
  'grok-4':                         'grok-4',
  'grok-4-beta':                    'grok-4',
  'qwen-3':                         'qwen-3',
  'qwen3-72b':                      'qwen-3',
  'kimi-k2.6':                      'kimi-k2-6',
  'kimi-k2-6':                      'kimi-k2-6',
  'glm-5':                          'glm-5',
  'glm-5-plus':                     'glm-5',
  'step-3':                         'step-3',
  'stepfun/step-3':                 'step-3',
  'baichuan-5':                     'baichuan-5',
  'command-r2-plus':                'command-r2-plus',
  'command-r2-plus-2025':           'command-r2-plus',
  'nous-hermes-4':                  'nous-hermes-4',
  'jamba-3':                        'jamba-3',
  'ai21/jamba-3':                   'jamba-3',
  'apple-intelligence-3':           'apple-intelligence-3',
}

const ARENA_SOURCES = [
  // API JSON non-officielle — liste de fichiers possibles
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results.json',
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20241201.json',
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20250101.json',
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20250201.json',
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20250301.json',
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20250401.json',
  'https://huggingface.co/datasets/lmarena-ai/chatbot-arena-leaderboard/resolve/main/elo_results_20250501.json',
  // CSV fallback
  'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard/resolve/main/leaderboard_table.csv',
]

async function fetchArenaJSON(url: string): Promise<ArenaScore[]> {
  const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json() as { model_order?: string[]; elo_rating_final?: Record<string, number> }
  if (!data.elo_rating_final) throw new Error('No elo_rating_final')

  const sorted = Object.entries(data.elo_rating_final)
    .sort((a, b) => b[1] - a[1])
    .map(([name, elo], i) => ({
      model_name: name.toLowerCase().trim(),
      elo: Math.round(elo),
      rank: i + 1,
      num_battles: 0,
      updated_at: new Date().toISOString(),
    }))
  return sorted
}

async function fetchArenaCSV(url: string): Promise<ArenaScore[]> {
  const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  const lines = text.trim().split('\n').slice(1)
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
  if (scores.length === 0) throw new Error('Empty CSV')
  return scores
}

async function fetchArenaFromWeb(): Promise<ArenaScore[]> {
  // Tente chaque source dans l'ordre jusqu'à ce qu'une réussisse
  for (const url of ARENA_SOURCES) {
    try {
      if (url.endsWith('.json')) {
        return await fetchArenaJSON(url)
      } else {
        return await fetchArenaCSV(url)
      }
    } catch {
      continue
    }
  }
  return []
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
  const scores = await fetchArenaFromWeb()
  return scores
}

/** Détecte les modèles présents sur Arena mais ABSENTS de notre base mockModels */
export async function detectNewArenaModels(): Promise<{ name: string; elo: number; rank: number }[]> {
  const scores = await getArenaScores()
  const knownIds = new Set(Object.values(ARENA_NAME_MAP))
  const knownNames = new Set(mockModels.map(m => m.id))

  const unknown: { name: string; elo: number; rank: number }[] = []
  for (const s of scores) {
    const mappedId = ARENA_NAME_MAP[s.model_name]
    if (!mappedId && !knownNames.has(s.model_name)) {
      unknown.push({ name: s.model_name, elo: s.elo, rank: s.rank })
    }
  }
  return unknown.slice(0, 20) // max 20 nouveaux
}

// ── Supabase persistence & quality validation ─────────────────────────────

import { supabaseAdmin, isSupabaseConfigured } from './supabase/admin'

/** Valide la qualité des scores avant stockage */
function validateScoreQuality(
  newScore: ArenaScore,
  previousElo: number | null
): { isValid: boolean; notes: string; delta: number | null } {
  const elo = newScore.elo
  const prev = previousElo

  // Règles de validation
  if (elo < 800 || elo > 1600) {
    return { isValid: false, notes: `ELO aberrant (${elo})`, delta: null }
  }

  if (prev !== null) {
    const delta = elo - prev
    // Un modèle ne perd/gagne pas plus de 150 ELO en 24h
    if (Math.abs(delta) > 150) {
      return { isValid: false, notes: `Delta trop grand (${delta}) depuis ${prev}`, delta }
    }
    // Un modèle ne perd pas plus de 50 ELO sans raison majeure
    if (delta < -50) {
      return { isValid: false, notes: `Chute suspecte de ${delta} ELO`, delta }
    }
  }

  return { isValid: true, notes: 'OK', delta: prev !== null ? elo - prev : null }
}

/** Sauvegarde les scores Arena dans Supabase avec validation */
export async function saveArenaScoresToSupabase(scores: ArenaScore[]): Promise<{
  saved: number
  rejected: number
  newDetected: number
}> {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { saved: 0, rejected: 0, newDetected: 0 }
  }

  // Récupérer les scores précédents pour validation
  const { data: previousScores } = await supabaseAdmin
    .from('arena_scores')
    .select('model_id, elo')
    .eq('is_validated', true)
    .order('fetched_at', { ascending: false })

  const prevMap: Record<string, number> = {}
  if (previousScores) {
    for (const row of previousScores) {
      if (!prevMap[row.model_id]) prevMap[row.model_id] = row.elo
    }
  }

  let saved = 0
  let rejected = 0
  const newDetected: string[] = []

  for (const score of scores) {
    const mappedId = ARENA_NAME_MAP[score.model_name]
    const modelId = mappedId ?? score.model_name
    const prevElo = prevMap[modelId] ?? null

    const validation = validateScoreQuality(score, prevElo)

    if (!mappedId && !newDetected.includes(score.model_name)) {
      newDetected.push(score.model_name)
    }

    const { error } = await supabaseAdmin.from('arena_scores').insert({
      model_id: modelId,
      model_name: score.model_name,
      elo: score.elo,
      rank: score.rank,
      num_battles: score.num_battles,
      source: 'arena_live',
      is_validated: validation.isValid,
      validation_notes: validation.notes,
      delta_from_previous: validation.delta,
      previous_elo: prevElo,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      rejected++
    } else {
      saved++
      if (!validation.isValid) rejected++
    }
  }

  return { saved, rejected, newDetected: newDetected.length }
}

/** Lit les derniers scores validés depuis Supabase */
export async function getLatestScoresFromSupabase(): Promise<ArenaScore[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('arena_scores')
    .select('*')
    .eq('is_validated', true)
    .order('fetched_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  // Prendre le plus récent par model_id
  const seen = new Set<string>()
  const result: ArenaScore[] = []
  for (const row of data) {
    if (seen.has(row.model_id)) continue
    seen.add(row.model_id)
    result.push({
      model_name: row.model_name.toLowerCase(),
      elo: row.elo,
      rank: row.rank,
      num_battles: row.num_battles ?? 0,
      updated_at: row.fetched_at,
    })
  }
  return result
}

export async function getMergedModels(): Promise<Model[]> {
  // 1. Essayer Supabase en priorité (qualité validée)
  const dbScores = await getLatestScoresFromSupabase()

  // 2. Sinon scraper live
  const [arenaScores, speedMap] = await Promise.allSettled([
    dbScores.length > 0 ? Promise.resolve(dbScores) : getArenaScores(),
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
