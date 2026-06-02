import { NextResponse } from 'next/server'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ranking = await getRanking()
    const header = 'rank,model,organization,elo,eloDelta,votes,category\n'
    const rows = ranking.models.map((m, i) =>
      `${i+1},${m.name},${m.organization},${m.elo},${m.eloDelta},${m.samples??0},${m.category??'proprietary'}`
    ).join('\n')

    const csv = header + rows
    const date = new Date().toISOString().slice(0, 10)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'Content-Disposition': `attachment; filename="ai-hub-leaderboard-${date}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to generate CSV' }, { status: 500 })
  }
}
