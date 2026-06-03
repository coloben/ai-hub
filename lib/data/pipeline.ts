import { unstable_cache } from 'next/cache'
import { fetchArenaRanking, fetchFeedPosts } from './sources'
import { getFallbackRanking, getUnavailableFeed } from './fallback'
import { RankingDataSchema, FeedDataSchema } from './schema'
import type { RankingData, FeedData } from './schema'

/* ── Cache config ──────────────────────────────────────────────────────── */

const CACHE_TTL_SECONDS = 300 // 5 min — données fraîches, pas 1h

/* ── Ranking pipeline ──────────────────────────────────────────────────── */

export const getRanking = unstable_cache(
  async (): Promise<RankingData> => {
    try {
      const data = await fetchArenaRanking()
      return RankingDataSchema.parse(data)
    } catch (err) {
      console.warn('[Pipeline] Arena fetch failed, using fallback:', err)
      return getFallbackRanking()
    }
  },
  ['ranking', 'arena-ai'],
  { revalidate: CACHE_TTL_SECONDS, tags: ['ranking'] }
)

/* ── Feed pipeline ─────────────────────────────────────────────────────── */

export const getFeed = unstable_cache(
  async (): Promise<FeedData> => {
    try {
      const data = await fetchFeedPosts()
      if (data.posts.length === 0) {
        throw new Error('No posts returned from external sources')
      }
      return FeedDataSchema.parse(data)
    } catch (err) {
      console.warn('[Pipeline] Feed fetch failed:', err)
      return getUnavailableFeed()
    }
  },
  ['feed', 'aggregated'],
  { revalidate: CACHE_TTL_SECONDS, tags: ['feed'] }
)

/* ── On-demand revalidation helpers ────────────────────────────────────── */

export async function revalidateRanking() {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('ranking')
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function revalidateFeed() {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('feed')
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
