import { hasDatabase } from '@/lib/db'
import { ensureVoteSchema, getPool, withDbRetry } from '@/lib/db'
import type { CommunityModelRank } from '@/lib/live/schema'

const LEADERBOARD_SQL = `
WITH expanded AS (
  SELECT
    winner_id AS model_id,
    1 AS win,
    0 AS loss
  FROM community_votes
  WHERE ($1::text IS NULL OR category = $1)
  UNION ALL
  SELECT
    CASE WHEN winner_id = model_low THEN model_high ELSE model_low END AS model_id,
    0 AS win,
    1 AS loss
  FROM community_votes
  WHERE ($1::text IS NULL OR category = $1)
),
agg AS (
  SELECT
    model_id,
    SUM(win)::int AS wins,
    SUM(loss)::int AS losses,
    (SUM(win) + SUM(loss))::int AS duels
  FROM expanded
  GROUP BY model_id
  HAVING (SUM(win) + SUM(loss)) > 0
)
SELECT
  model_id,
  wins,
  losses,
  duels,
  ROUND(100.0 * wins / NULLIF(duels, 0))::int AS win_rate
FROM agg
ORDER BY win_rate DESC, duels DESC, wins DESC
LIMIT $2
`

function toRank(row: {
  model_id: string
  wins: number
  losses: number
  duels: number
  win_rate: number
}): CommunityModelRank {
  const winRate = row.win_rate
  return {
    modelId: row.model_id,
    wins: row.wins,
    losses: row.losses,
    duels: row.duels,
    winRate,
    communityScore: 1000 + Math.round((winRate - 50) * 4) + Math.min(row.duels, 50),
  }
}

export async function getCommunityModelLeaderboard(
  category?: string,
  limit = 15
): Promise<CommunityModelRank[]> {
  if (!hasDatabase()) return []

  return withDbRetry(async () => {
    await ensureVoteSchema()
    const pool = getPool()
    const cat = category && category !== 'all' ? category : null
    const { rows } = await pool.query<{
      model_id: string
      wins: number
      losses: number
      duels: number
      win_rate: number
    }>(LEADERBOARD_SQL, [cat, limit])
    return rows.map(toRank)
  })
}
