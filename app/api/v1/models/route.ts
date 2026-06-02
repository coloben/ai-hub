import { NextResponse } from 'next/server'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ranking = await getRanking()
    const data = ranking.models.map(m => ({
      id: m.id,
      name: m.name,
      organization: m.organization,
      category: m.category ?? 'proprietary',
      elo: m.elo,
      eloDelta: m.eloDelta,
      votes: m.samples ?? 0,
    }))

    return NextResponse.json(
      { data, meta: { total: data.length, updatedAt: ranking.updatedAt, source: ranking.source } },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to load models' }, { status: 500 })
  }
}
