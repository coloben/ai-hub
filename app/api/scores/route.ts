import { NextRequest, NextResponse } from 'next/server'
import { getArenaScores, getMergedModels, detectNewArenaModels, ARENA_NAME_MAP } from '@/lib/arena-scraper'

export const revalidate = 3600

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// GET /api/scores — retourne TOP modèles (meilleurs scores) + NOUVEAUX modèles détectés
export async function GET() {
  const start = Date.now()
  try {
    const [arenaScores, mergedModels, newDetected] = await Promise.allSettled([
      getArenaScores(),
      getMergedModels(),
      detectNewArenaModels(),
    ])

    const scores = arenaScores.status === 'fulfilled' ? arenaScores.value : []
    const models = mergedModels.status === 'fulfilled' ? mergedModels.value : []
    const newModels = newDetected.status === 'fulfilled' ? newDetected.value : []

    // TOP 20 modèles par ELO (meilleurs scores)
    const topModels = scores.slice(0, 20).map(s => ({
      name: s.model_name,
      elo: s.elo,
      rank: s.rank,
      mapped_to: ARENA_NAME_MAP[s.model_name] ?? null,
    }))

    return NextResponse.json({
      top_models: topModels,
      new_models_detected: newModels,
      models_enriched: models.length,
      source: scores.length > 0 ? 'arena_live' : 'mock_fallback',
      fetched_at: new Date().toISOString(),
      duration_ms: Date.now() - start,
    }, { headers: CORS })
  } catch (err) {
    return NextResponse.json({
      error: 'fetch failed',
      message: err instanceof Error ? err.message : String(err),
      source: 'error',
      fetched_at: new Date().toISOString(),
    }, { status: 500, headers: CORS })
  }
}

// POST /api/scores — appelé par le cron Vercel toutes les heures
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET || 'dev-secret'
  const auth = request.headers.get('authorization')

  if (!auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  try {
    const [models, newModels] = await Promise.all([
      getMergedModels(),
      detectNewArenaModels(),
    ])
    return NextResponse.json({
      refreshed: true,
      models_count: models.length,
      new_models_detected: newModels.length,
      new_models: newModels.slice(0, 10),
      duration_ms: Date.now() - start,
      refreshed_at: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      error: 'refresh failed',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
