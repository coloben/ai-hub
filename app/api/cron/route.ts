import { NextRequest, NextResponse } from 'next/server'
import { CronResponse } from '@/lib/types'
import { runIngestion, sourceConnectors } from '@/lib/ingestion'
import { generateAlertEvents } from '@/lib/alerts'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev-secret'

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const refreshed: string[] = []
  const errors: string[] = []

  try {
    const run = await runIngestion(6)
    refreshed.push(...run.connectors.filter(c => c.enabled).map(c => c.name))
  } catch (err) {
    errors.push(`ingestion: ${err instanceof Error ? err.message : String(err)}`)
  }

  try {
    generateAlertEvents()
  } catch (err) {
    errors.push(`alerts: ${err instanceof Error ? err.message : String(err)}`)
  }

  const response: CronResponse = {
    refreshed,
    errors,
    duration_ms: Date.now() - startTime,
  }

  return NextResponse.json(response)
}
