import { z } from 'zod'

export const VoteCategorySchema = z.enum([
  'global',
  'coding',
  'creativity',
  'reasoning',
  'french',
  'multimodal',
])

export const SubmitVoteSchema = z.object({
  category: VoteCategorySchema,
  modelAId: z.string().min(1).max(128),
  modelBId: z.string().min(1).max(128),
  choice: z.enum(['A', 'B']),
  voterId: z.string().min(8).max(64),
})

export type SubmitVoteInput = z.infer<typeof SubmitVoteSchema>

export interface PairVoteStats {
  category: string
  modelAId: string
  modelBId: string
  votesForA: number
  votesForB: number
  total: number
  pctA: number
}

export interface SubmitVoteResult {
  ok: boolean
  duplicate?: boolean
  stats: PairVoteStats
}
