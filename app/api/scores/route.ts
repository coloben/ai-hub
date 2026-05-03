import { NextRequest, NextResponse } from 'next/server'
import { getArenaScores, getMergedModels } from '@/lib/arena-scraper'

export const revalidate = 3600

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// GET /api/scores — retourne les scores Arena live
export async function GET() {
  const start = Date.now()
  try {
    const [arenaScores, mergedModels] = await Promise.allSettled([
      getArenaScores(),
      getMergedModels(),
    ])

    const scores = arenaScores.status === 'fulfilled' ? arenaScores.value : []
    const models = mergedModels.status === 'fulfilled' ? mergedModels.value : []

    return NextResponse.json({
      arena_scores: scores.slice(0, 50),
      models_updated: models.length,
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
    const models = await getMergedModels()
    return NextResponse.json({
      refreshed: true,
      models_count: models.length,
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
