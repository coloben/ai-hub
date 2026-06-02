import { randomUUID } from 'crypto'
import { ensureVoteSchema, getPool, withDbRetry } from '@/lib/db'
import type { SubmitVoteInput, SubmitVoteResult, PairVoteStats } from './schema'
import { canonicalPair, winnerId } from './pair'

async function computeStats(
  category: string,
  modelAId: string,
  modelBId: string
): Promise<PairVoteStats> {
  const [low, high] = canonicalPair(modelAId, modelBId)
  const pool = getPool()
  const { rows } = await pool.query<{ winner_id: string; count: string }>(
    `SELECT winner_id, COUNT(*)::text AS count
     FROM community_votes
     WHERE category = $1 AND model_low = $2 AND model_high = $3
     GROUP BY winner_id`,
    [category, low, high]
  )
  let votesForA = 0
  let votesForB = 0
  for (const row of rows) {
    const n = parseInt(row.count, 10)
    if (row.winner_id === modelAId) votesForA = n
    else if (row.winner_id === modelBId) votesForB = n
  }
  const total = votesForA + votesForB
  const pctA = total > 0 ? Math.round((votesForA / total) * 100) : 50
  return { category, modelAId, modelBId, votesForA, votesForB, total, pctA }
}

export async function getPairStatsFromPg(
  category: string,
  modelAId: string,
  modelBId: string
): Promise<PairVoteStats> {
  await ensureVoteSchema()
  return withDbRetry(() => computeStats(category, modelAId, modelBId))
}

export async function submitVoteToPg(input: SubmitVoteInput): Promise<SubmitVoteResult> {
  return withDbRetry(async () => {
    await ensureVoteSchema()
    const [low, high] = canonicalPair(input.modelAId, input.modelBId)
    const picked = winnerId(input.choice, input.modelAId, input.modelBId)
    const pool = getPool()

    let duplicate = false
    try {
      await pool.query(
        `INSERT INTO community_votes (id, category, model_low, model_high, winner_id, voter_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), input.category, low, high, picked, input.voterId]
      )
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === '23505') {
        duplicate = true
      } else {
        throw err
      }
    }

    const stats = await computeStats(input.category, input.modelAId, input.modelBId)
    return { ok: true, duplicate, stats }
  })
}
