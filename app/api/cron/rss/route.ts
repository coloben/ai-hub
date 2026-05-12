import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { runScheduledIngestion } from '@/lib/scheduler'
import { generateAlertEvents } from '@/lib/alerts'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const errors: string[] = []

  try {
    const result = await runScheduledIngestion('daily')
    errors.push(...result.errors)

    try {
      generateAlertEvents()
    } catch (err) {
      errors.push(`alerts: ${err instanceof Error ? err.message : String(err)}`)
    }

    revalidatePath('/')
    revalidatePath('/leaderboard')
    revalidatePath('/news')
    revalidatePath('/feed')

    return NextResponse.json({
      ok: true,
      type: 'rss',
      duration_ms: Date.now() - startTime,
      items_ingested: result.items_ingested,
      sources_processed: result.sources_processed,
      errors,
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Ingestion failed',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    }, { status: 500 })
  }
}
