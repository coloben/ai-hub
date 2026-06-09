import { hasDatabase } from '@/lib/db'
import { ensureAllSchemas, getPool, withDbRetry } from '@/lib/db'
import { getCommunityStats, type CommunityStats } from '@/lib/votes/stats'
import { getCommunityModelLeaderboard } from '@/lib/votes/leaderboard'
import { getRanking } from '@/lib/data/pipeline'
import type { LivePlatformSnapshot, SocialPlatformStats } from './schema'

async function getSocialStatsFromPg(): Promise<SocialPlatformStats> {
  if (!hasDatabase()) {
    return { communityPostCount: 0, totalPostVotes: 0, totalPostScore: 0 }
  }

  return withDbRetry(async () => {
    await ensureAllSchemas()
    const pool = getPool()
    const { rows } = await pool.query<{
      posts: string
      votes: string
      score_sum: string
    }>(`
      SELECT
        (SELECT COUNT(*)::text FROM social_posts WHERE kind = 'community') AS posts,
        (SELECT COUNT(*)::text FROM social_post_votes) AS votes,
        (SELECT COALESCE(SUM(score), 0)::text FROM social_posts WHERE kind = 'community') AS score_sum
    `)
    const row = rows[0]
    return {
      communityPostCount: parseInt(row?.posts ?? '0', 10),
      totalPostVotes: parseInt(row?.votes ?? '0', 10),
      totalPostScore: parseInt(row?.score_sum ?? '0', 10),
    }
  })
}

export async function getLivePlatformSnapshot(category = 'global'): Promise<LivePlatformSnapshot> {
  const [community, social, leaderboard, ranking] = await Promise.all([
    getCommunityStats(),
    getSocialStatsFromPg().catch(() => ({
      communityPostCount: 0,
      totalPostVotes: 0,
      totalPostScore: 0,
    })),
    getCommunityModelLeaderboard(category).catch(() => []),
    getRanking(),
  ])

  const arenaVotesTotal = ranking.models.reduce((s, m) => s + (m.samples ?? 0), 0)

  return {
    generatedAt: new Date().toISOString(),
    community: community as CommunityStats,
    social,
    leaderboard,
    arena: {
      modelCount: ranking.models.length,
      votesTotal: arenaVotesTotal,
      source: ranking.source,
      updatedAt: ranking.updatedAt,
      topModel: ranking.models[0]?.name ?? null,
      topElo: ranking.models[0]?.elo ?? null,
    },
  }
}
