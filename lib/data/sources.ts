import {
  ArenaModelSchema,
  FeedPostSchema,
  type ArenaModel,
  type ArenaScoreKind,
  type ArenaBoard,
  type ArenaBoardsData,
  type FeedPost,
  type FeedData,
  type RankingData,
} from './schema'
import { formatArenaModelName } from './model-names'

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

export const ARENA_BOARD_CONFIG: ArenaBoard[] = [
  {
    id: 'text',
    label: 'Text',
    description: 'Chat & rédaction générale',
    scoreKind: 'elo',
    sourceUrl: 'https://arena.ai/leaderboard/text',
  },
  {
    id: 'code',
    label: 'Code / WebDev',
    description: 'Développement web & code',
    scoreKind: 'elo',
    sourceUrl: 'https://arena.ai/leaderboard/code',
  },
  {
    id: 'agent',
    label: 'Agent',
    description: 'Taux de victoire relatif vs baseline',
    scoreKind: 'relative',
    sourceUrl: 'https://arena.ai/leaderboard/agent',
  },
  {
    id: 'vision',
    label: 'Vision',
    description: 'Multimodal image + texte',
    scoreKind: 'elo',
    sourceUrl: 'https://arena.ai/leaderboard/vision',
  },
]

const LEGACY_TEXT_FILES = ['text-battle.json', 'leaderboard.json']

function recentArenaDates(count = 14): string[] {
  const today = new Date()
  const candidates: string[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    candidates.push(d.toISOString().slice(0, 10))
  }
  return candidates
}

function slugifyModelId(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function fetchArenaBoardSnapshot(
  date: string,
  boardId: string
): Promise<{ entries: ArenaEntry[]; sourceUrl?: string } | null> {
  const files = boardId === 'text' ? [`${boardId}.json`, ...LEGACY_TEXT_FILES] : [`${boardId}.json`]

  for (const file of files) {
    try {
      const url = `${ARENA_GH_RAW}/data/${date}/${file}`
      const data = await fetchJson(url, 5000)
      const models = data?.models ?? data?.leaderboard
      if (Array.isArray(models) && models.length > 0) {
        return {
          entries: models as ArenaEntry[],
          sourceUrl: typeof data?.meta?.source_url === 'string' ? data.meta.source_url : undefined,
        }
      }
    } catch {
      continue
    }
  }
  return null
}

async function findArenaSnapshots(boardId: string): Promise<{
  current: ArenaEntry[]
  snapshotDate: string
  prev: ArenaEntry[] | null
  prevDate: string | null
  sourceUrl?: string
}> {
  let current: { entries: ArenaEntry[]; snapshotDate: string; sourceUrl?: string } | null = null
  let prev: { entries: ArenaEntry[]; snapshotDate: string } | null = null

  for (const date of recentArenaDates()) {
    const snap = await fetchArenaBoardSnapshot(date, boardId)
    if (!snap) continue
    if (!current) {
      current = { entries: snap.entries, snapshotDate: date, sourceUrl: snap.sourceUrl }
    } else if (!prev) {
      prev = { entries: snap.entries, snapshotDate: date }
      break
    }
  }

  if (!current) {
    throw new Error(`No arena leaderboard data for board ${boardId}`)
  }

  return {
    current: current.entries,
    snapshotDate: current.snapshotDate,
    prev: prev?.entries ?? null,
    prevDate: prev?.snapshotDate ?? null,
    sourceUrl: current.sourceUrl,
  }
}

function normalizeArenaEntry(
  entries: ArenaEntry[],
  options: {
    prevScores?: Map<string, number>
    snapshotDate: string
    boardId: string
    scoreKind: ArenaScoreKind
  }
): ArenaModel[] {
  const models: ArenaModel[] = []
  const updatedAt = `${options.snapshotDate}T12:00:00.000Z`

  for (const entry of entries.slice(0, 25)) {
    try {
      const score = Math.round(entry.score)
      const prev = options.prevScores?.get(entry.model)
      const eloDelta = prev != null ? score - prev : 0
      const displayName = formatArenaModelName(entry.model)

      const model = ArenaModelSchema.parse({
        id: slugifyModelId(entry.model),
        name: displayName,
        organization: entry.vendor,
        elo: score,
        eloDelta,
        confidenceInterval: Math.round(entry.ci ?? 0),
        scoreKind: options.scoreKind,
        arenaBoard: options.boardId,
        rank: entry.rank,
        samples: entry.votes,
        category: (entry.license === 'proprietary' ? 'proprietary' : 'open-weight') as ArenaModel['category'],
        updatedAt,
      })
      models.push(model)
    } catch {
      /* skip invalid */
    }
  }
  return models
}

function buildPrevScoreMap(entries: ArenaEntry[] | null): Map<string, number> {
  const prevScores = new Map<string, number>()
  if (!entries) return prevScores
  for (const e of entries) {
    prevScores.set(e.model, Math.round(e.score))
  }
  return prevScores
}

export async function fetchArenaBoard(boardId: string): Promise<RankingData & { boardId: string }> {
  const config = ARENA_BOARD_CONFIG.find((b) => b.id === boardId) ?? ARENA_BOARD_CONFIG[0]
  const { current, snapshotDate, prev, sourceUrl } = await findArenaSnapshots(config.id)
  const models = normalizeArenaEntry(current, {
    prevScores: buildPrevScoreMap(prev),
    snapshotDate,
    boardId: config.id,
    scoreKind: config.scoreKind,
  })

  if (models.length === 0) {
    throw new Error(`Arena board ${boardId} returned no models`)
  }

  return {
    boardId: config.id,
    models,
    updatedAt: `${snapshotDate}T12:00:00.000Z`,
    source: sourceUrl ? `arena-ai/${config.id}` : 'arena-ai',
  }
}

export async function fetchArenaBoards(): Promise<ArenaBoardsData> {
  const rankings: Record<string, RankingData> = {}
  let snapshotDate = new Date().toISOString().slice(0, 10)

  await Promise.all(
    ARENA_BOARD_CONFIG.map(async (board) => {
      try {
        const data = await fetchArenaBoard(board.id)
        rankings[board.id] = {
          models: data.models,
          updatedAt: data.updatedAt,
          source: data.source,
        }
        snapshotDate = data.updatedAt.slice(0, 10)
      } catch (err) {
        console.warn(`[Arena] board ${board.id} failed:`, err)
      }
    })
  )

  if (!rankings.text) {
    throw new Error('Arena text board unavailable')
  }

  return {
    boards: ARENA_BOARD_CONFIG.filter((b) => rankings[b.id]),
    rankings,
    defaultBoard: 'text',
    snapshotDate,
    updatedAt: `${snapshotDate}T12:00:00.000Z`,
    source: 'arena-ai',
  }
}

export async function fetchArenaRanking(): Promise<{
  models: ArenaModel[]
  updatedAt: string
  source: 'arena-ai'
}> {
  const text = await fetchArenaBoard('text')
  return {
    models: text.models,
    updatedAt: text.updatedAt,
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

      const publishedRaw =
        (item.publishedAt as string) ??
        (item.published_at as string) ??
        (item.createdAt as string) ??
        (item.created_at as string) ??
        ''
      const publishedAt = publishedRaw ? new Date(publishedRaw).toISOString() : undefined
      const timeLabel = publishedAt ? getTimeAgo(publishedAt) : '1 j'

      const post = FeedPostSchema.parse({
        id: `hf-${String(item.id ?? Math.random()).slice(0, 20)}`,
        author: String(
          item.author ??
            (Array.isArray(item.authors) ? (item.authors as Array<{name:string}>)[0]?.name : undefined) ??
            'Hugging Face'
        ),
        handle: 'huggingface',
        time: timeLabel,
        title,
        content: String(item.summary ?? item.abstract ?? '').slice(0, 500),
        tags: (item.tags as string[])?.slice(0, 5) ?? ['research', 'paper'],
        votes: 0,
        comments: Number(item.comments ?? 0),
        shares: 0,
        badge: 'Research',
        type: 'news' as const,
        sourceUrl: String(item.url ?? `https://huggingface.co/papers/${item.id ?? ''}`),
        publishedAt,
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

      const publishedAt = published ? new Date(published).toISOString() : undefined

      const post = FeedPostSchema.parse({
        id: `arxiv-${arxivId.slice(0, 20)}`,
        author: String(item.author ?? 'arXiv'),
        handle: 'arxiv',
        time: timeDiff,
        title,
        content: String(item.summary ?? '').slice(0, 500),
        tags: ['research', 'cs.AI', 'paper'],
        votes: 0,
        comments: 0,
        shares: 0,
        badge: 'Paper',
        type: 'news' as const,
        sourceUrl: `https://arxiv.org/abs/${arxivId}`,
        publishedAt,
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

export async function fetchFeedPosts(): Promise<FeedData> {
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
    feedTier: posts.length > 0 ? ('live' as const) : ('unavailable' as const),
  }
}
