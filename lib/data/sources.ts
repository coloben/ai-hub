import { unstable_cache } from 'next/cache'
import {
  ArenaModelSchema,
  FeedPostSchema,
  type ArenaModel,
  type FeedPost,
} from './schema'

/* ── Helpers ───────────────────────────────────────────────────────────── */

async function fetchJson(url: string, timeoutMs = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    clearTimeout(id)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

/* ── Source 1 : Arena AI Leaderboard (daily GitHub mirror) ─────────────── */

const ARENA_GH_REPO = 'oolong-tea-2026/arena-ai-leaderboards'
const ARENA_GH_RAW = `https://raw.githubusercontent.com/${ARENA_GH_REPO}/main`

async function fetchArenaLatestDate(): Promise<string> {
  // Get the latest date from the repo tree (cache 5 min)
  const url = `https://api.github.com/repos/${ARENA_GH_REPO}/git/trees/main?recursive=1`
  const data = await fetchJson(url)
  const tree: Array<{ path: string }> = data.tree ?? []
  const dates = sorted(set(
    tree
      .filter((t) => t.path.startsWith('data/') && t.path.split('/').length === 3)
      .map((t) => t.path.split('/')[1])
  ))
  if (dates.length === 0) throw new Error('No arena dates found')
  return dates[dates.length - 1]
}

function sorted(arr: string[]): string[] {
  return [...arr].sort()
}

function set(arr: string[]): string[] {
  return [...new Set(arr)]
}

interface ArenaEntry {
  rank: number
  model: string
  vendor: string
  license: string
  score: number
  ci: number
  votes: number
}

async function fetchArenaTextLeaderboard(): Promise<ArenaEntry[]> {
  // Try today first, then yesterday, then day before
  const today = new Date()
  const candidates: string[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    candidates.push(d.toISOString().slice(0, 10))
  }

  for (const date of candidates) {
    try {
      const url = `${ARENA_GH_RAW}/data/${date}/text.json`
      const data = await fetchJson(url, 5000)
      if (data?.models?.length > 0) {
        return data.models as ArenaEntry[]
      }
    } catch {
      continue
    }
  }
  throw new Error('No arena leaderboard data found for recent dates')
}

function normalizeArenaEntry(entries: ArenaEntry[]): ArenaModel[] {
  const models: ArenaModel[] = []
  for (const entry of entries.slice(0, 25)) {
    try {
      const model = ArenaModelSchema.parse({
        id: entry.model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: entry.model,
        organization: entry.vendor,
        elo: Math.round(entry.score),
        eloDelta: 0, // daily snapshots don't include delta
        samples: entry.votes,
        category: (entry.license === 'proprietary' ? 'proprietary' : 'open-weight') as ArenaModel['category'],
        updatedAt: new Date().toISOString(),
      })
      models.push(model)
    } catch {
      /* skip invalid */
    }
  }
  return models
}

export async function fetchArenaRanking(): Promise<{
  models: ArenaModel[]
  updatedAt: string
  source: 'arena-ai'
}> {
  const entries = await fetchArenaTextLeaderboard()
  const models = normalizeArenaEntry(entries)

  if (models.length === 0) {
    throw new Error('Arena fetch returned no valid models')
  }

  return {
    models,
    updatedAt: new Date().toISOString(),
    source: 'arena-ai',
  }
}

/* ── Source 2 : Hugging Face Daily Papers ──────────────────────────────── */

async function fetchHfPapersRaw(): Promise<Record<string, unknown>[]> {
  try {
    const data = await fetchJson('https://huggingface.co/api/papers', 8000)
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.papers)) return data.papers
    return []
  } catch {
    return []
  }
}

function normalizeHfPapers(raw: Record<string, unknown>[]): FeedPost[] {
  const posts: FeedPost[] = []
  for (const item of raw.slice(0, 10)) {
    try {
      const title = String(item.title ?? '')
      if (!title) continue

      const post = FeedPostSchema.parse({
        id: `hf-${String(item.id ?? Math.random()).slice(0, 20)}`,
        author: String(
          item.author ??
            (Array.isArray(item.authors) ? (item.authors as Array<{name:string}>)[0]?.name : undefined) ??
            'Hugging Face'
        ),
        handle: 'huggingface',
        time: '1 j',
        title,
        content: String(item.summary ?? item.abstract ?? '').slice(0, 500),
        tags: (item.tags as string[])?.slice(0, 5) ?? ['research', 'paper'],
        votes: Number(item.upvotes ?? item.likes ?? 0),
        comments: Number(item.comments ?? 0),
        shares: 0,
        badge: 'Research',
        type: 'news' as const,
        sourceUrl: String(item.url ?? `https://huggingface.co/papers/${item.id ?? ''}`),
      })
      posts.push(post)
    } catch {
      /* skip invalid */
    }
  }
  return posts
}

/* ── Source 3 : arXiv cs.AI (Atom XML) ─────────────────────────────────── */

async function fetchArxivPapersRaw(): Promise<Record<string, unknown>[]> {
  const url =
    'https://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending'

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const text = await res.text()

    // Parse Atom XML — lightweight, no external deps
    const entries: Record<string, unknown>[] = []
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let match: RegExpExecArray | null

    while ((match = entryRegex.exec(text)) !== null) {
      const block = match[1]
      const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? ''
      const id = block.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() ?? ''
      const summary = block.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim() ?? ''
      const published = block.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ?? ''
      const authorMatch = block.match(/<name>([\s\S]*?)<\/name>/)
      const author = authorMatch?.[1]?.trim() ?? 'arXiv'

      if (title) {
        entries.push({ title, id, summary, published, author })
      }
    }
    return entries
  } catch {
    return []
  }
}

function normalizeArxiv(raw: Record<string, unknown>[]): FeedPost[] {
  const posts: FeedPost[] = []
  for (const item of raw.slice(0, 8)) {
    try {
      const title = String(item.title ?? '')
      if (!title) continue

      const arxivId = String(item.id ?? '').replace('http://arxiv.org/abs/', '')
      const published = String(item.published ?? '')
      const timeDiff = published ? getTimeAgo(published) : '1 j'

      const post = FeedPostSchema.parse({
        id: `arxiv-${arxivId.slice(0, 20)}`,
        author: String(item.author ?? 'arXiv'),
        handle: 'arxiv',
        time: timeDiff,
        title,
        content: String(item.summary ?? '').slice(0, 500),
        tags: ['research', 'cs.AI'],
        votes: 0,
        comments: 0,
        shares: 0,
        badge: 'Paper',
        type: 'news' as const,
        sourceUrl: `https://arxiv.org/abs/${arxivId}`,
      })
      posts.push(post)
    } catch {
      /* skip */
    }
  }
  return posts
}

function getTimeAgo(isoDate: string): string {
  try {
    const then = new Date(isoDate).getTime()
    const now = Date.now()
    const diffH = Math.floor((now - then) / 3600000)
    if (diffH < 1) return '< 1 h'
    if (diffH < 24) return `${diffH} h`
    const diffD = Math.floor(diffH / 24)
    return `${diffD} j`
  } catch {
    return '1 j'
  }
}

/* ── Aggregated feed fetcher ─────────────────────────────────────────── */

export async function fetchFeedPosts(): Promise<{
  posts: FeedPost[]
  updatedAt: string
  sources: string[]
}> {
  const posts: FeedPost[] = []
  const sources: string[] = []

  // HF Papers
  try {
    const hfRaw = await fetchHfPapersRaw()
    const hfPosts = normalizeHfPapers(hfRaw)
    if (hfPosts.length > 0) {
      posts.push(...hfPosts)
      sources.push('huggingface-papers')
    }
  } catch {
    /* ignore */
  }

  // arXiv cs.AI
  try {
    const arxivRaw = await fetchArxivPapersRaw()
    const arxivPosts = normalizeArxiv(arxivRaw)
    if (arxivPosts.length > 0) {
      posts.push(...arxivPosts)
      sources.push('arxiv-cs-ai')
    }
  } catch {
    /* ignore */
  }

  return {
    posts,
    updatedAt: new Date().toISOString(),
    sources,
  }
}
