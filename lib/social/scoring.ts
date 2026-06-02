import type { FeedSort, SocialPost } from './schema'

/** Reddit-style hot score (simplified) */
export function hotScore(post: SocialPost): number {
  const s = post.score
  const order = Math.log10(Math.max(Math.abs(s), 1))
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0
  const seconds = (Date.parse(post.createdAt) - Date.UTC(2024, 0, 1)) / 1000
  return sign * order + seconds / 45000
}

export function risingScore(post: SocialPost): number {
  const ageHours = (Date.now() - Date.parse(post.createdAt)) / 3_600_000
  if (ageHours > 48) return -Infinity
  return post.score / Math.pow(ageHours + 2, 1.2)
}

export function sortPosts(posts: SocialPost[], sort: FeedSort): SocialPost[] {
  const copy = [...posts]
  switch (sort) {
    case 'new':
      return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    case 'top':
      return copy.sort((a, b) => b.score - a.score)
    case 'rising':
      return copy.sort((a, b) => risingScore(b) - risingScore(a))
    case 'hot':
    default:
      return copy.sort((a, b) => hotScore(b) - hotScore(a))
  }
}

export function updateScore(upvotes: number, downvotes: number): number {
  return upvotes - downvotes
}
