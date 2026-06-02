import { hasDatabase } from '@/lib/db'
import type { SubmitVoteInput, SubmitVoteResult, PairVoteStats } from './schema'
import { getPairStatsFromFile, submitVoteToFile } from './file-store'
import { getPairStatsFromPg, submitVoteToPg } from './pg-store'

export type { SubmitVoteInput, SubmitVoteResult, PairVoteStats }
export { SubmitVoteSchema, VoteCategorySchema } from './schema'

export async function getPairVoteStats(
  category: string,
  modelAId: string,
  modelBId: string
): Promise<PairVoteStats> {
  if (hasDatabase()) {
    try {
      return await getPairStatsFromPg(category, modelAId, modelBId)
    } catch (err) {
      console.warn('[Votes] Postgres unavailable, falling back to file:', err)
    }
  }
  return getPairStatsFromFile(category, modelAId, modelBId)
}

export async function submitCommunityVote(input: SubmitVoteInput): Promise<SubmitVoteResult> {
  if (hasDatabase()) {
    try {
      return await submitVoteToPg(input)
    } catch (err) {
      console.warn('[Votes] Postgres write failed, falling back to file:', err)
    }
  }
  try {
    return await submitVoteToFile(input)
  } catch (err) {
    console.error('[Votes] all backends failed:', err)
    throw err
  }
}
