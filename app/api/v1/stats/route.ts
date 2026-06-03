import { NextResponse } from 'next/server'
import { getCommunityStats } from '@/lib/votes/stats'
import { getTrustStatus } from '@/lib/trust'
import { getRanking, getFeed } from '@/lib/data/pipeline'
import { hasDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [community, trust, ranking, feed] = await Promise.all([
    getCommunityStats(),
    getTrustStatus(),
    getRanking(),
    getFeed(),
  ])

  const arenaVotesTotal = ranking.models.reduce((s, m) => s + (m.samples ?? 0), 0)

  const feedLive = feed.sources.some(
    (s) => s === 'arxiv-cs-ai' || s === 'huggingface-papers'
  )

  return NextResponse.json({
    ok: true,
    community,
    trust,
    persistence: {
      databaseConfigured: hasDatabase(),
      communityPersisted: community.persisted,
    },
    feed: {
      sources: feed.sources,
      postCount: feed.posts.length,
      updatedAt: feed.updatedAt,
      tier: feed.feedTier ?? (feedLive ? 'live' : 'unavailable'),
    },
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
