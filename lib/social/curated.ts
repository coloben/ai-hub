import type { FeedPost } from '@/lib/data/schema'
import type { HubId, Flair } from './hubs'
import type { SocialPost } from './schema'

const TAG_HUB: Record<string, HubId> = {
  claude: 'llm',
  gpt: 'llm',
  openai: 'llm',
  gemini: 'llm',
  google: 'llm',
  deepseek: 'open-source',
  llama: 'open-source',
  meta: 'open-source',
  grok: 'llm',
  coding: 'coding',
  code: 'coding',
  safety: 'safety',
  policy: 'safety',
}

function inferHub(tags: string[]): HubId {
  for (const tag of tags) {
    const hub = TAG_HUB[tag.toLowerCase()]
    if (hub) return hub
  }
  return 'general'
}

function inferFlair(post: FeedPost): Flair {
  if (post.badge === 'Release' || post.type === 'news') return 'Release'
  if (post.badge === 'Benchmark' || post.type === 'benchmark') return 'Benchmark'
  if (post.badge === 'Official') return 'News'
  return 'News'
}

function parseTimeToIso(time: string): string {
  const now = Date.now()
  const m = time.match(/(\d+)\s*(h|min|j|d)/i)
  if (!m) return new Date(now).toISOString()
  const n = parseInt(m[1], 10)
  const unit = m[2].toLowerCase()
  let ms = 0
  if (unit === 'h') ms = n * 3_600_000
  else if (unit === 'min') ms = n * 60_000
  else ms = n * 86_400_000
  return new Date(now - ms).toISOString()
}

export function curatedToSocial(post: FeedPost): SocialPost {
  const up = Math.max(0, Math.floor(post.votes * 0.92))
  const down = Math.max(0, post.votes - up)
  return {
    id: post.id,
    kind: 'curated',
    hub: inferHub(post.tags),
    flair: inferFlair(post),
    author: post.author,
    handle: post.handle,
    title: post.title,
    content: post.content,
    tags: post.tags,
    upvotes: up,
    downvotes: down,
    score: post.votes,
    commentCount: post.comments,
    createdAt: parseTimeToIso(post.time),
    sourceUrl: post.sourceUrl,
  }
}
