import { NextRequest, NextResponse } from 'next/server'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'global'

  try {
    const ranking = await getRanking()
    const models = ranking.models

    // Filter by category if requested
    const filtered = category === 'global'
      ? models
      : models.filter(m => m.category === category)

    const data = filtered.map((m, i) => ({
      rank: i + 1,
      model: m.name,
      organization: m.organization,
      elo: m.elo,
      eloDelta: m.eloDelta,
      votes: m.samples ?? 0,
      category: m.category,
    }))

    return NextResponse.json(
      { data, meta: { category, total: data.length, updatedAt: ranking.updatedAt, source: ranking.source } },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to load leaderboard' }, { status: 500 })
  }
}
