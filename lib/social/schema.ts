import { z } from 'zod'
import { HUB_IDS, FLAIRS } from './hubs'

export const HubIdSchema = z.enum(HUB_IDS)
export const FlairSchema = z.enum(FLAIRS)
export const FeedSortSchema = z.enum(['hot', 'top', 'new', 'rising'])
export const VoteDirectionSchema = z.enum(['up', 'down'])

export const CreatePostSchema = z.object({
  hub: HubIdSchema.default('general'),
  flair: FlairSchema.default('Discussion'),
  title: z.string().min(3).max(300),
  content: z.string().min(1).max(4000),
  tags: z.array(z.string().min(1).max(32)).max(8).default([]),
  author: z.string().min(1).max(64),
  handle: z.string().min(1).max(32).regex(/^[a-zA-Z0-9_]+$/),
})

export const SocialPostSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['community', 'curated']),
  hub: HubIdSchema,
  flair: FlairSchema,
  author: z.string().min(1),
  handle: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()),
  upvotes: z.number().int().min(0),
  downvotes: z.number().int().min(0),
  score: z.number().int(),
  commentCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
  sourceUrl: z.string().url().optional(),
  importSource: z.enum(['arxiv', 'huggingface', 'fallback', 'system']).optional(),
  /** Arena sample count — only on curated posts, not community upvotes */
  arenaVotes: z.number().int().min(0).optional(),
})

export const CommentSchema = z.object({
  id: z.string().min(1),
  postId: z.string().min(1),
  parentId: z.string().optional(),
  author: z.string().min(1),
  handle: z.string().min(1),
  content: z.string().min(1).max(2000),
  upvotes: z.number().int().min(0),
  downvotes: z.number().int().min(0),
  score: z.number().int(),
  createdAt: z.string().datetime(),
})

export const VotePostSchema = z.object({
  postId: z.string().min(1),
  direction: VoteDirectionSchema,
  voterId: z.string().min(8).max(64),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  author: z.string().min(1).max(64),
  handle: z.string().min(1).max(32),
  parentId: z.string().optional(),
})

export type SocialPost = z.infer<typeof SocialPostSchema>
export type Comment = z.infer<typeof CommentSchema>
export type FeedSort = z.infer<typeof FeedSortSchema>
export type CreatePostInput = z.infer<typeof CreatePostSchema>
