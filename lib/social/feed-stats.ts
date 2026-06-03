import type { SocialPost } from './schema'
import type { HubId } from './hubs'
import { HUB_IDS } from './hubs'

export function countPostsByHub(posts: SocialPost[]): Record<HubId, { community: number; curated: number }> {
  const counts = Object.fromEntries(
    HUB_IDS.map((id) => [id, { community: 0, curated: 0 }])
  ) as Record<HubId, { community: number; curated: number }>

  for (const p of posts) {
    if (!HUB_IDS.includes(p.hub as HubId)) continue
    const hub = p.hub as HubId
    if (p.kind === 'community') counts[hub].community++
    else counts[hub].curated++
  }
  return counts
}
