import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/db'
import { getRanking, getFeed } from '@/lib/data/pipeline'
import { getCommunityStats } from '@/lib/votes/stats'
import { classifyRankingSource } from '@/lib/trust'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const started = Date.now()
  const checks: Record<string, { ok: boolean; ms?: number; detail?: string }> = {}

  try {
    const t0 = Date.now()
    const ranking = await getRanking()
    checks.ranking = {
      ok: ranking.models.length > 0,
      ms: Date.now() - t0,
      detail: `${ranking.source} · ${ranking.models.length} models · tier ${classifyRankingSource(ranking.source)}`,
    }
  } catch (e) {
    checks.ranking = { ok: false, detail: e instanceof Error ? e.message : 'failed' }
  }

  try {
    const t0 = Date.now()
    const stats = await getCommunityStats()
    checks.community = {
      ok: true,
      ms: Date.now() - t0,
      detail: `${stats.totalDuelVotes} duels · persisted=${stats.persisted}`,
    }
  } catch (e) {
    checks.community = { ok: false, detail: e instanceof Error ? e.message : 'failed' }
  }

  checks.database = {
    ok: hasDatabase(),
    detail: hasDatabase() ? 'DATABASE_URL set' : 'file/tmp fallback only',
  }

  try {
    const t0 = Date.now()
    const feed = await getFeed()
    const live = feed.sources.some((s) => s === 'arxiv-cs-ai' || s === 'huggingface-papers')
    checks.feed = {
      ok: live,
      ms: Date.now() - t0,
      detail: `${feed.sources.join(', ')} · ${feed.posts.length} posts · tier ${feed.feedTier ?? 'live'}`,
    }
  } catch (e) {
    checks.feed = { ok: false, detail: e instanceof Error ? e.message : 'failed' }
  }

  const allOk = checks.ranking?.ok !== false && checks.feed?.ok !== false
  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      uptimeMs: Date.now() - started,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  )
}
