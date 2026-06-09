import { z } from 'zod'

/* ── Base schemas ──────────────────────────────────────────────────────── */

export const ArenaScoreKindSchema = z.enum(['elo', 'relative'])

export const ArenaModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  organization: z.string().min(1),
  elo: z.number().int(),
  eloDelta: z.number().int(),
  confidenceInterval: z.number().int().min(0).optional(),
  scoreKind: ArenaScoreKindSchema.default('elo'),
  arenaBoard: z.string().optional(),
  rank: z.number().int().min(1).optional(),
  samples: z.number().int().optional(),
  category: z.enum(['proprietary', 'open-weight', 'open-source']).optional(),
  updatedAt: z.string().datetime().optional(),
})

export const ArenaBoardSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  scoreKind: ArenaScoreKindSchema,
  sourceUrl: z.string().url().optional(),
})

export const NewsItemSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(1000),
  category: z.enum(['release', 'benchmark', 'research', 'community', 'policy']),
  tags: z.array(z.string().min(1)).max(10),
  publishedAt: z.string().datetime(),
  author: z.string().optional(),
  votes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
})

export const BenchmarkSchema = z.object({
  id: z.string().min(1),
  modelId: z.string().min(1),
  modelName: z.string().min(1),
  benchmark: z.enum([
    'MMLU',
    'HumanEval',
    'GPQA',
    'MATH',
    'SWE-bench',
    'Arena-Elo',
    'MT-Bench',
  ]),
  score: z.number().min(0).max(100),
  context: z.number().int().optional(), // context window in tokens
  updatedAt: z.string().datetime(),
})

export const ComparisonSchema = z.object({
  id: z.string().min(1),
  modelA: z.string().min(1),
  modelB: z.string().min(1),
  votesA: z.number().int().min(0),
  votesB: z.number().int().min(0),
  totalVotes: z.number().int().min(0),
  category: z.string().optional(),
})

export const CommunityBenchmarkSchema = z.object({
  id: z.string().min(1),
  modelA: z.string().min(1),
  modelB: z.string().min(1),
  category: z.enum(['global', 'coding', 'creativity', 'reasoning', 'french', 'multimodal']),
  votesA: z.number().int().min(0).default(0),
  votesB: z.number().int().min(0).default(0),
  totalVotes: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  lastVotedAt: z.string().datetime().optional(),
})

export const CommunityLeaderboardSchema = z.object({
  model: z.string().min(1),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  ties: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
  totalVotes: z.number().int().min(0),
  elo: z.number().int().min(0),
  category: z.enum(['global', 'coding', 'creativity', 'reasoning', 'french', 'multimodal']),
})

export const FeedPostSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  handle: z.string().min(1),
  avatar: z.string().optional(),
  time: z.string().min(1),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(2000),
  tags: z.array(z.string().min(1)).max(10),
  votes: z.number().min(0),
  comments: z.number().int().min(0),
  shares: z.number().min(0),
  badge: z.string().optional(),
  type: z.enum(['news', 'community', 'benchmark']),
  sourceUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
})

/* ── Aggregated data schema ────────────────────────────────────────────── */

export const RankingDataSchema = z.object({
  models: z.array(ArenaModelSchema).min(1),
  updatedAt: z.string().datetime(),
  source: z.string().min(1),
})

export const FeedDataSchema = z.object({
  posts: z.array(FeedPostSchema),
  updatedAt: z.string().datetime(),
  sources: z.array(z.string()),
  feedTier: z.enum(['live', 'unavailable']).optional(),
})

export const ArenaBoardsDataSchema = z.object({
  boards: z.array(ArenaBoardSchema),
  rankings: z.record(z.string(), RankingDataSchema),
  defaultBoard: z.string(),
  snapshotDate: z.string(),
  updatedAt: z.string().datetime(),
  source: z.string().min(1),
})

/* ── Type exports ──────────────────────────────────────────────────────── */

export type ArenaModel = z.infer<typeof ArenaModelSchema>
export type ArenaScoreKind = z.infer<typeof ArenaScoreKindSchema>
export type ArenaBoard = z.infer<typeof ArenaBoardSchema>
export type ArenaBoardsData = z.infer<typeof ArenaBoardsDataSchema>
export type NewsItem = z.infer<typeof NewsItemSchema>
export type Benchmark = z.infer<typeof BenchmarkSchema>
export type Comparison = z.infer<typeof ComparisonSchema>
export type CommunityBenchmark = z.infer<typeof CommunityBenchmarkSchema>
export type CommunityLeaderboard = z.infer<typeof CommunityLeaderboardSchema>
export type FeedPost = z.infer<typeof FeedPostSchema>
export type RankingData = z.infer<typeof RankingDataSchema>
export type FeedData = z.infer<typeof FeedDataSchema>
