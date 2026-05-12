import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getArenaScores, saveArenaScoresToSupabase, detectNewArenaModels } from '@/lib/arena-scraper'
import { isSupabaseConfigured } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    const arenaScores = await getArenaScores()
    const newModels = await detectNewArenaModels()

    let arenaResult = { saved: 0, rejected: 0, newDetected: 0, source: 'disabled' as string }

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

    revalidatePath('/leaderboard')
    revalidatePath('/models')

    return NextResponse.json({
      ok: true,
      type: 'arena',
      duration_ms: Date.now() - startTime,
      arena: arenaResult,
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Arena scraping failed',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    }, { status: 500 })
  }
}
