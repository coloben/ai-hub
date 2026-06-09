import { NextRequest, NextResponse } from 'next/server'
import { getLivePlatformSnapshot } from '@/lib/live/platform-stats'
import { getTrustStatus } from '@/lib/trust'
import { getFeed } from '@/lib/data/pipeline'
import { hasDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') ?? 'global'

  const [snapshot, trust, feed] = await Promise.all([
    getLivePlatformSnapshot(category),
    getTrustStatus(),
    getFeed(),
  ])

  const feedLive = feed.sources.some(
    (s) => s === 'arxiv-cs-ai' || s === 'huggingface-papers'
  )

  return NextResponse.json(
    {
      ok: true,
      generatedAt: snapshot.generatedAt,
      community: snapshot.community,
      social: snapshot.social,
      leaderboard: snapshot.leaderboard,
      arena: snapshot.arena,
      trust,
      persistence: {
        databaseConfigured: hasDatabase(),
        communityPersisted: snapshot.community.persisted,
      },
      feed: {
        sources: feed.sources,
        postCount: feed.posts.length,
        updatedAt: feed.updatedAt,
        tier: feed.feedTier ?? (feedLive ? 'live' : 'unavailable'),
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    }
  )
}
