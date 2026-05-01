import { NewsItem, Model } from './types'
import { ModelHistoryPoint } from './ingestion'

export type DbMode = 'memory' | 'postgres' | 'supabase'

function detectMode(): DbMode {
  if (process.env.DATABASE_URL) return 'postgres'
  const supaKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && supaKey) return 'supabase'
  return 'memory'
}

export const DB_MODE: DbMode = detectMode()

let _pg: import('pg').Pool | null = null

async function getPool(): Promise<import('pg').Pool | null> {
  if (DB_MODE !== 'postgres') return null
  if (_pg) return _pg
  try {
    const { Pool } = await import('pg')
    _pg = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
    return _pg
  } catch {
    return null
  }
}

let _supabase: import('@supabase/supabase-js').SupabaseClient | null = null

async function getSupabase(): Promise<import('@supabase/supabase-js').SupabaseClient | null> {
  if (DB_MODE !== 'supabase') return null
  if (_supabase) return _supabase
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supaKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supaKey
    )
    return _supabase
  } catch {
    return null
  }
}

const _memory: { news: NewsItem[]; snapshots: ModelHistoryPoint[] } = {
  news: [],
  snapshots: [],
}

export async function dbUpsertNewsItems(items: NewsItem[]): Promise<void> {
  if (DB_MODE === 'memory') {
    const existingIds = new Set(_memory.news.map(n => n.id))
    for (const item of items) {
      if (!existingIds.has(item.id)) {
        _memory.news.push(item)
        existingIds.add(item.id)
      }
    }
    _memory.news = _memory.news.slice(-500)
    return
  }

  if (DB_MODE === 'supabase') {
    const client = await getSupabase()
    if (!client) return
    await client.from('news_items').upsert(
      items.map(item => ({ ...item, ingested_at: new Date().toISOString() })),
      { onConflict: 'id', ignoreDuplicates: true }
    )
    return
  }

  if (DB_MODE === 'postgres') {
    const pool = await getPool()
    if (!pool) return
    for (const item of items) {
      await pool.query(
        `INSERT INTO news_items (id, title, summary, source, category, published_at, url, tags, is_breaking, hype_score, ingested_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.title, item.summary, item.source, item.category, item.published_at, item.url, JSON.stringify(item.tags), item.is_breaking, item.hype_score]
      )
    }
  }
}

export async function dbGetRecentNews(limit = 50): Promise<NewsItem[]> {
  if (DB_MODE === 'memory') {
    return [..._memory.news].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, limit)
  }

  if (DB_MODE === 'supabase') {
    const client = await getSupabase()
    if (!client) return []
    const { data } = await client.from('news_items').select('*').order('published_at', { ascending: false }).limit(limit)
    return (data ?? []) as NewsItem[]
  }

  if (DB_MODE === 'postgres') {
    const pool = await getPool()
    if (!pool) return []
    const { rows } = await pool.query<NewsItem>(
      `SELECT id, title, summary, source, category, published_at, url, tags, is_breaking, hype_score
       FROM news_items ORDER BY published_at DESC LIMIT $1`,
      [limit]
    )
    return rows.map(r => ({ ...r, tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags }))
  }

  return []
}

export async function dbInsertModelSnapshot(snapshots: ModelHistoryPoint[]): Promise<void> {
  if (DB_MODE === 'memory') {
    _memory.snapshots.push(...snapshots)
    _memory.snapshots = _memory.snapshots.slice(-2000)
    return
  }

  if (DB_MODE === 'supabase') {
    const client = await getSupabase()
    if (!client) return
    await client.from('model_snapshots').insert(snapshots)
    return
  }

  if (DB_MODE === 'postgres') {
    const pool = await getPool()
    if (!pool) return
    for (const s of snapshots) {
      await pool.query(
        `INSERT INTO model_snapshots (model_id, model_name, provider, captured_at, arena_elo, price_input, price_output, rank)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [s.model_id, s.model_name, s.provider, s.captured_at, s.arena_elo, s.price_input, s.price_output, s.rank]
      )
    }
  }
}

export async function dbGetModelHistory(modelId: string, days = 30): Promise<ModelHistoryPoint[]> {
  if (DB_MODE === 'memory') {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString()
    return _memory.snapshots.filter(s => s.model_id === modelId && s.captured_at >= cutoff)
  }

  if (DB_MODE === 'supabase') {
    const client = await getSupabase()
    if (!client) return []
    const cutoff = new Date(Date.now() - days * 86400000).toISOString()
    const { data } = await client.from('model_snapshots').select('*').eq('model_id', modelId).gte('captured_at', cutoff).order('captured_at', { ascending: true })
    return (data ?? []) as ModelHistoryPoint[]
  }

  if (DB_MODE === 'postgres') {
    const pool = await getPool()
    if (!pool) return []
    const { rows } = await pool.query<ModelHistoryPoint>(
      `SELECT * FROM model_snapshots WHERE model_id = $1 AND captured_at >= NOW() - INTERVAL '${days} days' ORDER BY captured_at ASC`,
      [modelId]
    )
    return rows
  }

  return []
}
