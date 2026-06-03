import { getFeed } from '@/lib/data/pipeline'
import { hasDatabase } from '@/lib/db'
import { curatedToSocial } from './curated'
import { sortPosts } from './scoring'
import type { FeedSort, SocialPost, CreatePostInput, Comment } from './schema'
import type { HubId } from './hubs'
import {
  listCommunityPostsFromFile,
  createPostInFile,
  votePostInFile,
  getCuratedVoteDelta,
  listCommentsFromFile,
  addCommentInFile,
  getPostFromFile,
} from './file-store'
import {
  listCommunityPostsFromPg,
  createPostInPg,
  votePostInPg,
  getCuratedVotesPg,
  listCommentsFromPg,
  addCommentInPg,
  getCommunityPostPg,
} from './pg-store'
import type { z } from 'zod'
import { CreateCommentSchema } from './schema'

type CreateCommentInput = z.infer<typeof CreateCommentSchema>

export type { SocialPost, FeedSort, CreatePostInput, Comment }
export { HUBS, getHub, FLAIRS, FLAIR_COLORS } from './hubs'
export { sortPosts } from './scoring'

async function listCommunity(): Promise<SocialPost[]> {
  if (hasDatabase()) {
    try {
      return await listCommunityPostsFromPg()
    } catch (err) {
      console.warn('[Social] Postgres failed, file fallback:', err)
    }
  }
  try {
    return await listCommunityPostsFromFile()
  } catch (err) {
    console.warn('[Social] file store failed:', err)
    return []
  }
}

async function enrichCurated(posts: SocialPost[]): Promise<SocialPost[]> {
  return Promise.all(
    posts.map(async (p) => {
      try {
        if (hasDatabase()) {
          const v = await getCuratedVotesPg(p.id, p.upvotes, p.downvotes)
          return { ...p, ...v }
        }
        const v = await getCuratedVoteDelta(p.id, p.upvotes, p.downvotes)
        return { ...p, ...v }
      } catch (err) {
        console.warn('[Social] enrich vote skip', p.id, err)
        return p
      }
    })
  )
}

export async function getUnifiedFeed(options?: {
  sort?: FeedSort
  hub?: HubId | 'all'
}): Promise<{ posts: SocialPost[]; updatedAt: string }> {
  const sort = options?.sort ?? 'hot'
  const hub = options?.hub ?? 'all'

  try {
    const [feedData, community] = await Promise.all([getFeed(), listCommunity()])
    const curated = await enrichCurated(feedData.posts.map(curatedToSocial))
    let merged = [...community, ...curated]

    if (hub !== 'all') {
      merged = merged.filter((p) => p.hub === hub)
    }

    return {
      posts: sortPosts(merged, sort),
      updatedAt: feedData.updatedAt,
    }
  } catch (err) {
    console.error('[Social] getUnifiedFeed failed:', err)
    return { posts: [], updatedAt: new Date().toISOString() }
  }
}

export async function getPostById(id: string): Promise<SocialPost | null> {
  const community = hasDatabase()
    ? await getCommunityPostPg(id).catch(() => null)
    : await getPostFromFile(id)

  if (community) return community

  const feed = await getFeed()
  const raw = feed.posts.find((p) => p.id === id)
  if (!raw) return null
  const post = curatedToSocial(raw)
  if (hasDatabase()) {
    try {
      const v = await getCuratedVotesPg(id, post.upvotes, post.downvotes)
      return { ...post, ...v }
    } catch {
      /* noop */
    }
  }
  const v = await getCuratedVoteDelta(id, post.upvotes, post.downvotes)
  return { ...post, ...v }
}

export async function createCommunityPost(input: CreatePostInput): Promise<SocialPost> {
  if (hasDatabase()) {
    try {
      return await createPostInPg(input)
    } catch (err) {
      console.warn('[Social] create pg failed:', err)
    }
  }
  return createPostInFile(input)
}

export async function voteOnPost(
  postId: string,
  voterId: string,
  direction: 'up' | 'down',
  kind: 'community' | 'curated'
): Promise<{ ok: boolean; duplicate: boolean; post?: SocialPost; error?: string }> {
  if (kind === 'curated') {
    return {
      ok: false,
      duplicate: false,
      error: 'Les actualités importées ne sont pas votables — utilisez les posts communauté.',
    }
  }

  if (hasDatabase()) {
    try {
      const { duplicate } = await votePostInPg(postId, voterId, direction, false)
      const post = await getPostById(postId)
      return { ok: true, duplicate, post: post ?? undefined }
    } catch (err) {
      console.warn('[Social] vote pg failed:', err)
    }
  }

  const { post, duplicate } = await votePostInFile(postId, voterId, direction)
  return { ok: Boolean(post), duplicate, post: post ?? undefined }
}

export async function getComments(postId: string): Promise<Comment[]> {
  if (hasDatabase()) {
    try {
      return await listCommentsFromPg(postId)
    } catch (err) {
      console.warn('[Social] comments pg failed:', err)
    }
  }
  return listCommentsFromFile(postId)
}

export async function addComment(postId: string, input: CreateCommentInput): Promise<Comment | null> {
  const parsed = CreateCommentSchema.parse(input)
  if (hasDatabase()) {
    try {
      return await addCommentInPg(postId, parsed)
    } catch (err) {
      console.warn('[Social] add comment pg failed:', err)
    }
  }
  return addCommentInFile(postId, parsed)
}
