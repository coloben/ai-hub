import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { CronResponse } from '@/lib/types'
import { runScheduledIngestion, ScheduleMode, getSchedulerMetrics, getAllSourceHealth } from '@/lib/scheduler'
import { generateAlertEvents } from '@/lib/alerts'
import { getArenaScores, saveArenaScoresToSupabase, detectNewArenaModels } from '@/lib/arena-scraper'
import { isSupabaseConfigured } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev-secret'

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse mode from query params
  const { searchParams } = new URL(request.url)
  const mode = (searchParams.get('mode') as ScheduleMode) || 'full'
  
  const startTime = Date.now()
  const errors: string[] = []
  let arenaResult = { saved: 0, rejected: 0, newDetected: 0, source: 'disabled' as string }
  
  try {
    // ── 1. News ingestion (existing) ──────────────────────────────
    const result = await runScheduledIngestion(mode)
    errors.push(...result.errors)
    
    // Generate alerts if full or daily mode
    if (mode === 'full' || mode === 'daily') {
      try {
        generateAlertEvents()
      } catch (err) {
        errors.push(`alerts: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    
    // ── 2. Arena scores scraping + quality validation ─────────────
    try {
      const arenaScores = await getArenaScores()
      const newModels = await detectNewArenaModels()

      if (arenaScores.length > 0) {
        if (isSupabaseConfigured()) {
          const saved = await saveArenaScoresToSupabase(arenaScores)
          arenaResult = {
            saved: saved.saved,
            rejected: saved.rejected,
            newDetected: saved.newDetected + newModels.length,
            source: 'supabase_stored',
          }
        } else {
          // Pas de Supabase : on logue les scores détectés sans stocker
          arenaResult = {
            saved: 0,
            rejected: 0,
            newDetected: newModels.length,
            source: 'detected_only_no_db',
          }
        }
      } else {
        arenaResult.source = 'arena_fetch_failed'
      }
    } catch (err) {
      errors.push(`arena: ${err instanceof Error ? err.message : String(err)}`)
      arenaResult.source = 'error'
    }
    
    // Invalidate static caches after successful ingestion
    revalidatePath('/')
    revalidatePath('/leaderboard')
    revalidatePath('/news')
    revalidatePath('/feed')

    // Get current metrics
    const metrics = getSchedulerMetrics()
    const sourceHealth = getAllSourceHealth()
    
    const response: CronResponse & {
      mode: ScheduleMode
      sources_healthy: number
      sources_unhealthy: number
      circuit_breakers_open: number
      items_ingested: number
      average_latency_ms: number
      arena: typeof arenaResult
    } = {
      refreshed: result.mode === 'fast' 
        ? [`${result.sources_processed} critical sources (fast mode)`]
        : [`${result.sources_processed} sources (${mode} mode)`],
      errors,
      duration_ms: Date.now() - startTime,
      mode: result.mode,
      sources_healthy: metrics.sources_healthy,
      sources_unhealthy: metrics.sources_unhealthy,
      circuit_breakers_open: result.circuit_breakers_open,
      items_ingested: result.items_ingested,
      average_latency_ms: metrics.average_latency_ms,
      arena: arenaResult,
    }

    return NextResponse.json(response)
  } catch (err) {
    return NextResponse.json({
      error: 'Ingestion failed',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    }, { status: 500 })
  }
}

// GET endpoint for health check and status
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev-secret'

  // Allow public status check without auth, but require auth for detailed health
  const isAuthenticated = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === cronSecret
  
  const metrics = getSchedulerMetrics()
  const sourceHealth = getAllSourceHealth()
  
  return NextResponse.json({
    status: 'ok',
    last_run_at: metrics.last_run_at,
    items_ingested_total: metrics.items_ingested_total,
    sources_healthy: metrics.sources_healthy,
    sources_unhealthy: metrics.sources_unhealthy,
    average_latency_ms: metrics.average_latency_ms,
    ...(isAuthenticated && {
      source_health: sourceHealth,
      cron_schedule: '0 6 * * *',
    }),
  })
}
