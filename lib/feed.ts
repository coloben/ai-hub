/**
 * feed.ts — Pipeline de données IA temps réel — 7 sources indépendantes.
 *
 * Architecture :
 *   ① Hugging Face Daily Papers  — papers IA du jour, curés par la communauté HF
 *   ② Papers with Code           — papers ML avec implémentations GitHub
 *   ③ HF Models trending         — nouveaux modèles qui montent (likes 7j)
 *   ④ Hacker News Algolia        — communauté tech (2 requêtes consolidées)
 *   ⑤ RSS VentureBeat AI         — journalisme pro IA (sans dépendance XML)
 *   ⑥ RSS The Verge AI           — couverture grand public / industry
 *   ⑦ Reddit r/LocalLLaMA        — communauté open-source modèles
 *   ⑧ Reddit r/singularity       — news mainstream IA, très actif
 *
 * Toutes les sources tournent en parallèle (Promise.allSettled) avec timeout 8s.
 * Cache in-memory 5 min. Fallback mockNews si TOUT échoue.
 */

import { NewsItem, NewsCategory } from './types'
import { mockNews } from './mock-data'

// ── Cache in-memory ──────────────────────────────────────────────────────────

let _cache: { items: NewsItem[]; ts: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

// ── Types sources ────────────────────────────────────────────────────────────

interface HNHit {
  objectID: string
  title: string
  url: string | null
  story_text: string | null
  points: number
  num_comments: number
  created_at: string
}

interface RedditPost {
  data: {
    title: string
    url: string
    selftext: string
    ups: number
    num_comments: number
    created_utc: number
    subreddit: string
    permalink: string
  }
}

interface HFPaper {
  id: string
  paper: {
    title: string
    summary: string | null
    publishedAt: string
    upvotes: number
  }
}

interface PwCPaper {
  id: string
  arxiv_id: string | null
  url_abs: string
  title: string
  abstract: string | null
  published: string
  repositories?: { url: string }[]
}

interface HFModel {
  id: string
  modelId: string
  author: string
  pipeline_tag: string | null
  lastModified: string
  likes: number
  likes7d: number
}

// ── Classification par contenu ───────────────────────────────────────────────

const CLASSIFIERS: { pattern: RegExp; category: NewsCategory }[] = [
  { pattern: /\b(release|launch|announc|introduc|unveil|dévoil|lance|sortie|nouveau modèle|new model|shipped|available now|rollout)\b/i, category: 'release' },
  { pattern: /\b(benchmark|eval|score|test|leaderboard|elo|arena|humaneval|mmlu|gpqa|math benchmark|performance test)\b/i, category: 'benchmark' },
  { pattern: /\b(paper|arxiv|research|study|étude|survey|preprint|technical report)\b/i, category: 'research' },
  { pattern: /\b(price|cost|pricing|api cost|tarif|token price|cheaper|free tier|subscription)\b|[\$€]/i, category: 'pricing' },
  { pattern: /\b(hack|vulnerab|security|leak|exploit|jailbreak|prompt injection|privacy risk|data breach)\b/i, category: 'security' },
  { pattern: /\b(open.?source|github|huggingface|hf\.co|model card|weights|llama|mistral|deepseek|qwen|license|apache|mit license)\b/i, category: 'community' },
]

function classify(title: string, text: string): NewsCategory {
  const full = `${title} ${text}`.toLowerCase()
  for (const c of CLASSIFIERS) {
    if (c.pattern.test(full)) return c.category
  }
  return 'industry'
}

// ── Tags par extraction ──────────────────────────────────────────────────────

const TAG_PATTERNS: Record<string, RegExp> = {
  'OpenAI':     /\bopenai\b|\bgpt\b|\bchatgpt\b|\bo[234]-?(mini)?\b|\bcodex\b/i,
  'Anthropic':  /\banthropic\b|\bclaude\b/i,
  'Google':     /\bgoogle\b|\bgemini\b|\bdeepmind\b|\bvertex\b/i,
  'Meta':       /\bmeta\b|\bllama\b|\bfacebook\b/i,
  'Mistral':    /\bmistral\b/i,
  'DeepSeek':   /\bdeepseek\b/i,
  'xAI':        /\bxai\b|\bgrok\b/i,
  'Alibaba':    /\bqwen\b|\balibaba\b/i,
  'Microsoft':  /\bmicrosoft\b|\bcopilot\b|\bazure\b/i,
  'benchmark':  /\bbenchmark\b|\bscore\b|\bleaderboard\b|\barena\b|\beval\b/i,
  'open-source':/\bopen.?source\b|\bopen.?weight\b|\bweights.?released\b|\bmit.?license\b|\bapache\s?2/i,
  'agent':      /\bagent\b|\bautonomous\b|\btool.?use\b|\bcodex\b/i,
  'multimodal': /\bmultimodal\b|\bvision\b|\bimage\b|\bvideo\b|\baudio\b/i,
  'reasoning':  /\breasoning\b|\bchain.?of.?thought\b|\bmath\b|\blogic\b|\bthinking\b/i,
  'research':   /\bpaper\b|\barxiv\b|\bpreprint\b|\bstudy\b|\bresearch\b/i,
}

function extractTags(title: string, text: string): string[] {
  const full = `${title} ${text}`.toLowerCase()
  const found = Object.entries(TAG_PATTERNS)
    .filter(([, re]) => re.test(full))
    .map(([tag]) => tag)
  return Array.from(new Set(['AI', ...found])).slice(0, 6)
}

// ── Breaking + hype ──────────────────────────────────────────────────────────

function isBreaking(title: string, category: NewsCategory, engagement: number): boolean {
  const urgent = /\b(breaking|launch|release|unveil|new model|available now|shipped|open.?weight)\b/i.test(title)
  return (urgent && engagement > 80) || (category === 'release' && engagement > 120)
}

function computeHypeScore(points: number, comments: number): number {
  return Math.min(100, Math.round(points * 0.15 + comments * 0.5))
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function domainFromUrl(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'news' }
}

function sanitizeText(text: string | null, maxLen = 280): string {
  if (!text) return ''
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen)
}

// ── ① Hugging Face Daily Papers ──────────────────────────────────────────────

async function fetchHuggingFacePapers(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://huggingface.co/api/daily_papers', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const papers = await res.json() as HFPaper[]
    if (!Array.isArray(papers)) return []

    return papers.slice(0, 20).map(p => {
      const title = p.paper.title
      const rawSummary = p.paper.summary ?? ''
      const summary = rawSummary.replace(/\n/g, ' ').trim().slice(0, 300) + (rawSummary.length > 300 ? '…' : '')
      const upvotes = p.paper.upvotes ?? 0
      return {
        id: `hf-paper-${p.id}`,
        title,
        summary: summary || title,
        source: 'Hugging Face Papers',
        category: 'research' as NewsCategory,
        published_at: p.paper.publishedAt,
        url: `https://huggingface.co/papers/${p.id}`,
        tags: Array.from(new Set([...extractTags(title, rawSummary), 'research', 'paper'])).slice(0, 6),
        is_breaking: false,
        hype_score: Math.min(95, 45 + Math.round(upvotes * 0.4)),
        comment_count: 0,
        engagement_score: upvotes,
      } satisfies NewsItem
    })
  } catch { return [] }
}

// ── ② Papers with Code ───────────────────────────────────────────────────────

async function fetchPapersWithCode(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://paperswithcode.com/api/v1/papers/?format=json&ordering=-published&limit=15', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AI-Hub/1.0' },
    })
    if (!res.ok) return []
    const json = await res.json() as { results?: PwCPaper[] }
    if (!json.results) return []

    return json.results.map(p => {
      const title = p.title
      const abstract = sanitizeText(p.abstract, 300)
      const repoUrl = p.repositories?.[0]?.url ?? null
      const url = p.url_abs || (p.arxiv_id ? `https://arxiv.org/abs/${p.arxiv_id}` : '')
      if (!url) return null
      return {
        id: `pwc-${p.id}`,
        title,
        summary: abstract || title,
        source: 'Papers with Code',
        category: 'research' as NewsCategory,
        published_at: new Date(p.published).toISOString(),
        url,
        tags: Array.from(new Set([...extractTags(title, abstract), 'research', ...(repoUrl ? ['open-source'] : [])])).slice(0, 6),
        is_breaking: false,
        hype_score: repoUrl ? 65 : 52,
        comment_count: 0,
        engagement_score: 0,
      } satisfies NewsItem
    }).filter(Boolean) as NewsItem[]
  } catch { return [] }
}

// ── ③ Hugging Face Models trending ──────────────────────────────────────────

async function fetchHFModelReleases(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      'https://huggingface.co/api/models?sort=likes7d&direction=-1&limit=15&filter=text-generation',
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return []
    const models = await res.json() as HFModel[]
    if (!Array.isArray(models)) return []

    return models
      .filter(m => m.likes7d > 20)
      .map(m => {
        const author = m.id.split('/')[0] ?? m.author
        const modelName = m.id.split('/')[1] ?? m.id
        const title = `Nouveau modèle en tendance : ${m.id} (+${m.likes7d} ❤️ cette semaine)`
        const summary = `${m.id} est parmi les modèles text-generation les plus aimés cette semaine sur Hugging Face. Auteur : ${author}.`
        return {
          id: `hf-model-${m.id.replace(/\//g, '-')}`,
          title,
          summary,
          source: 'Hugging Face Models',
          category: classify(modelName, author),
          published_at: m.lastModified,
          url: `https://huggingface.co/${m.id}`,
          tags: Array.from(new Set(['AI', 'open-source', ...extractTags(m.id, author)])).slice(0, 6),
          is_breaking: m.likes7d > 200,
          hype_score: Math.min(95, 40 + Math.round(m.likes7d * 0.08)),
          comment_count: 0,
          engagement_score: m.likes7d,
        } satisfies NewsItem
      })
  } catch { return [] }
}

// ── ④ Hacker News ────────────────────────────────────────────────────────────

async function fetchHN(query: string, hits = 20): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${hits}`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return []
    const json = await res.json() as { hits?: HNHit[] }
    if (!json.hits) return []

    return json.hits
      .filter(h => h.url || h.story_text)
      .map(h => {
        const title = h.title
        const text = sanitizeText(h.story_text)
        const url = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
        const category = classify(title, text)
        const engagement = h.points + h.num_comments
        return {
          id: `hn-${h.objectID}`,
          title,
          summary: text || title,
          source: domainFromUrl(url),
          category,
          published_at: h.created_at,
          url,
          tags: extractTags(title, text),
          is_breaking: isBreaking(title, category, engagement),
          hype_score: computeHypeScore(h.points, h.num_comments),
          comment_count: h.num_comments,
          engagement_score: h.points,
        } satisfies NewsItem
      })
  } catch { return [] }
}

// ── ⑤⑥ RSS feeds (VentureBeat AI + The Verge AI) ────────────────────────────

function unescapeXML(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function extractXMLField(block: string, tag: string): string {
  // Try CDATA first, then plain tag — uses [\s\S] instead of /s flag
  const cdataRe = new RegExp(`<${tag}>[\\s\\S]*?<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>[\\s\\S]*?<\\/${tag}>`)
  const plainRe  = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)
  return (block.match(cdataRe)?.[1] ?? block.match(plainRe)?.[1] ?? '').trim()
}

function parseRSSItems(xml: string, source: string, limit = 12): NewsItem[] {
  const items: NewsItem[] = []
  // split on <item> boundaries without matchAll (avoids downlevelIteration requirement)
  const raw = xml.split('<item>')
  const blocks = raw.slice(1, limit + 1).map(chunk => chunk.split('</item>')[0])

  for (const block of blocks) {
    const title = unescapeXML(extractXMLField(block, 'title'))
    const link = (
      block.match(/<link>(https?:\/\/[^\s<]+)<\/link>/)?.[1] ??
      block.match(/<link\s[^>]*href="([^"]+)"/)?.[1] ?? ''
    ).trim()
    const pubDate = extractXMLField(block, 'pubDate')
    const rawDesc = extractXMLField(block, 'description')
    const description = unescapeXML(rawDesc).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300)

    if (!title || !link) continue
    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
    const category = classify(title, description)
    items.push({
      id: `rss-${source.replace(/\s/g, '-')}-${Buffer.from(link).toString('base64').slice(0, 14)}`,
      title,
      summary: description || title,
      source,
      category,
      published_at: publishedAt,
      url: link,
      tags: extractTags(title, description),
      is_breaking: false,
      hype_score: 58,
      comment_count: 0,
      engagement_score: 0,
    })
  }
  return items
}

async function fetchRSS(url: string, source: string, limit = 12): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AI-Hub/1.0 (news aggregator)', 'Accept': 'application/rss+xml, application/xml, text/xml' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRSSItems(xml, source, limit)
  } catch { return [] }
}

// ── ⑦⑧ Reddit ────────────────────────────────────────────────────────────────

async function fetchReddit(subreddit: string, limit = 10, time = 'day'): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=${time}`,
      {
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'AI-Hub/1.0 (by /u/ai-hub-bot)' },
      }
    )
    if (!res.ok) return []
    const json = await res.json() as { data?: { children?: RedditPost[] } }
    if (!json.data?.children) return []

    return json.data.children.map((post, i) => {
      const d = post.data
      const title = d.title
      const text = sanitizeText(d.selftext)
      const url = d.url.startsWith('/r/') ? `https://www.reddit.com${d.permalink}` : d.url
      const category = classify(title, text)
      const engagement = d.ups + d.num_comments
      return {
        id: `rd-${subreddit}-${i}-${d.created_utc}`,
        title,
        summary: text || title,
        source: `Reddit r/${d.subreddit}`,
        category,
        published_at: new Date(d.created_utc * 1000).toISOString(),
        url,
        tags: extractTags(title, text),
        is_breaking: isBreaking(title, category, engagement),
        hype_score: computeHypeScore(d.ups, d.num_comments),
        comment_count: d.num_comments,
        engagement_score: d.ups,
      } satisfies NewsItem
    })
  } catch { return [] }
}

// ── Déduplication ────────────────────────────────────────────────────────────

function dedup(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Export principal ─────────────────────────────────────────────────────────

/**
 * Pipeline complet : 8 sources parallèles, cache 5 min, fallback mockNews.
 * Ordre de priorité dans la liste finale : tri par date de publication.
 */
export async function getLiveNews(limitTotal = 30): Promise<NewsItem[]> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return _cache.items.slice(0, limitTotal)
  }

  const [hfPapers, pwcPapers, hfModels, hnMain, hnModels, rssVB, rssVerge, redditLLaMA, redditSingularity] =
    await Promise.allSettled([
      fetchHuggingFacePapers(),
      fetchPapersWithCode(),
      fetchHFModelReleases(),
      fetchHN('artificial intelligence large language model', 14),
      fetchHN('Claude Gemini GPT DeepSeek Llama Qwen release', 10),
      fetchRSS('https://venturebeat.com/category/ai/feed/', 'VentureBeat AI', 10),
      fetchRSS('https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'The Verge AI', 10),
      fetchReddit('LocalLLaMA', 8, 'day'),
      fetchReddit('singularity', 8, 'day'),
    ])

  const live: NewsItem[] = []
  const log = (label: string, r: PromiseSettledResult<NewsItem[]>) => {
    if (r.status === 'fulfilled') live.push(...r.value)
    else console.warn(`[feed] ${label} failed:`, r.reason)
  }

  log('HF Papers', hfPapers)
  log('Papers with Code', pwcPapers)
  log('HF Models', hfModels)
  log('HN main', hnMain)
  log('HN models', hnModels)
  log('RSS VentureBeat', rssVB)
  log('RSS The Verge', rssVerge)
  log('Reddit LocalLLaMA', redditLLaMA)
  log('Reddit singularity', redditSingularity)

  if (live.length === 0) {
    return [...mockNews].sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
  }

  const result = dedup(live)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 80)

  _cache = { items: result, ts: Date.now() }
  return result.slice(0, limitTotal)
}

/**
 * Alias — retourne les N news les plus récentes.
 */
export async function getEnrichedNews(limit = 20): Promise<NewsItem[]> {
  return getLiveNews(limit)
}
