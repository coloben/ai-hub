import { NextResponse } from 'next/server'
import { getCommunityStats } from '@/lib/votes/stats'
import { getTrustStatus } from '@/lib/trust'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [community, trust, ranking] = await Promise.all([
    getCommunityStats(),
    getTrustStatus(),
    getRanking(),
  ])

  const arenaVotesTotal = ranking.models.reduce((s, m) => s + (m.samples ?? 0), 0)

  return NextResponse.json({
    ok: true,
    community,
    trust,
    arena: {
      modelCount: ranking.models.length,
      votesTotal: arenaVotesTotal,
      source: ranking.source,
      updatedAt: ranking.updatedAt,
      topModel: ranking.models[0]?.name ?? null,
      topElo: ranking.models[0]?.elo ?? null,
    },
  })
}
