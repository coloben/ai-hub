/**
 * feed.ts — Pipeline de données IA temps réel.
 *
 * Stratégie v2 (robust + réel) :
 *   1. Fetch Hacker News Search API (JSON natif, gratuit, fiable) — requêtes IA
 *   2. Fetch Reddit r/LocalLLaMA top (discussions modèles open-source)
 *   3. Classification dynamique par analyse du contenu (pas par source)
 *   4. Hype score = engagement réel (points HN / upvotes Reddit)
 *   5. Déduplication + tri date
 *   6. Si TOUT échoue → fallback mockNews
 *
 * Sources :
 *   - HN Algolia : https://hn.algolia.com/api/v1/search?query=AI&tags=story
 *   - Reddit JSON : https://www.reddit.com/r/LocalLLaMA/top.json?limit=10&t=day
 */

import { NewsItem, NewsCategory } from './types'
import { mockNews } from './mock-data'

// ── Cache in-memory (évite de spammer HN/Reddit à chaque req) ───────────────

let _cache: { items: NewsItem[]; ts: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ── Types sources ────────────────────────────────────────────────────────────

interface HNHit {
  objectID: string
  title: string
  url: string | null
  story_text: string | null
  points: number
  num_comments: number
  created_at: string
  author: string
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
    author: string
    permalink: string
  }
}

// ── Classification par contenu (pas par source) ───────────────────────────────

const CLASSIFIERS: { pattern: RegExp; category: NewsCategory }[] = [
  { pattern: /\b(release|launch|announc|introduc|unveil|dévoil|lance|sortie|nouveau modèle|new model|shipped|available now|rollout)\b/i, category: 'release' },
  { pattern: /\b(benchmark|eval|score|test|leaderboard|elo|arena|humaneval|mmlu|gpqa|math benchmark|performance test)\b/i, category: 'benchmark' },
  { pattern: /\b(paper|arxiv|research|study|étude|survey|paper review|technical report|preprint)\b/i, category: 'research' },
  { pattern: /\b(price|cost|pricing|api cost|tarif|token price|cheaper|free tier|subscription)\b|[\$€]/i, category: 'pricing' },
  { pattern: /\b(hack|vulnerab|security|leak|exploit|jailbreak|prompt injection|privacy risk|data breach)\b/i, category: 'security' },
  { pattern: /\b(open source|github|huggingface|hf.co|model card|weights|llama|mistral|deepseek|qwen|license|apache|mit license)\b/i, category: 'community' },
]

function classify(title: string, text: string): NewsCategory {
  const full = `${title} ${text}`.toLowerCase()
  for (const c of CLASSIFIERS) {
    if (c.pattern.test(full)) return c.category
  }
  return 'industry'
}

// ── Tags par extraction de contenu ───────────────────────────────────────────

const TAG_PATTERNS: Record<string, RegExp> = {
  'OpenAI': /\bopenai\b|\bgpt\b|\bchatgpt\b|\bo3\b|\bo4-mini\b|\bcodex\b/i,
  'Anthropic': /\banthropic\b|\bclaude\b/i,
  'Google': /\bgoogle\b|\bgemini\b|\bdeepmind\b|\bvertex\b/i,
  'Meta': /\bmeta\b|\bllama\b|\bfacebook\b/i,
  'Mistral': /\bmistral\b/i,
  'DeepSeek': /\bdeepseek\b/i,
  'xAI': /\bxai\b|\bgrok\b/i,
  'Alibaba': /\bqwen\b|\balibaba\b/i,
  'Microsoft': /\bmicrosoft\b|\bcopilot\b|\bazure\b/i,
  'benchmark': /\bbenchmark\b|\bscore\b|\bleaderboard\b|\barena\b|\beval\b/i,
  'open-source': /\bopen.source\b|\bopen weight\b|\bweights released\b|\bmit license\b|\bapache 2/i,
  'agent': /\bagent\b|\bcodex\b|\bautonomous\b|\btool use\b/i,
  'multimodal': /\bmultimodal\b|\bvision\b|\bimage\b|\bvideo\b|\baudio\b/i,
  'reasoning': /\breasoning\b|\bchain of thought\b|\bmath\b|\blogic\b/i,
}

function extractTags(title: string, text: string): string[] {
  const full = `${title} ${text}`.toLowerCase()
  const found = Object.entries(TAG_PATTERNS)
    .filter(([, re]) => re.test(full))
    .map(([tag]) => tag)
  return Array.from(new Set(['AI', ...found])).slice(0, 6)
}

// ── Breaking detection ───────────────────────────────────────────────────────

function isBreaking(title: string, category: NewsCategory, engagement: number): boolean {
  const urgent = /\b(breaking|launch|release|unveil|dévoil|nouveau|new model|available now|shipped|open weight|free tier)\b/i.test(title)
  const hot = engagement > 100
  return (urgent && hot) || (category === 'release' && hot && /\b(launch|release|unveil|new)\b/i.test(title))
}

// ── Hype score = engagement réel normalisé ──────────────────────────────────

function computeHypeScore(points: number, comments: number): number {
  // HN : points 0-500+ ; Reddit : upvotes 0-500+
  // Formule : points * 0.15 + comments * 0.5, cap à 100
  const raw = points * 0.15 + comments * 0.5
  return Math.min(100, Math.round(raw))
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'news'
  }
}

function sanitizeText(text: string | null, maxLen = 280): string {
  if (!text) return ''
  return text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

// ── Fetch Hacker News ────────────────────────────────────────────────────────

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
      .filter(h => h.url || h.story_text) // au moins un lien ou du texte
      .map(h => {
        const title = h.title
        const text = sanitizeText(h.story_text)
        const url = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
        const category = classify(title, text)
        const engagement = h.points + h.num_comments
        const breaking = isBreaking(title, category, engagement)

        return {
          id: `hn-${h.objectID}`,
          title,
          summary: text || title,
          source: domainFromUrl(url),
          category,
          published_at: h.created_at,
          url,
          tags: extractTags(title, text),
          is_breaking: breaking,
          hype_score: computeHypeScore(h.points, h.num_comments),
          comment_count: h.num_comments,
          engagement_score: h.points,
        } satisfies NewsItem
      })
  } catch {
    return []
  }
}

// ── Fetch Reddit ───────────────────────────────────────────────────────────────

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
      const breaking = isBreaking(title, category, engagement)

      return {
        id: `rd-${subreddit}-${i}-${d.created_utc}`,
        title,
        summary: text || title,
        source: `Reddit r/${d.subreddit}`,
        category,
        published_at: new Date(d.created_utc * 1000).toISOString(),
        url,
        tags: extractTags(title, text),
        is_breaking: breaking,
        hype_score: computeHypeScore(d.ups, d.num_comments),
        comment_count: d.num_comments,
        engagement_score: d.ups,
      } satisfies NewsItem
    })
  } catch {
    return []
  }
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
 * Retourne les news fraîches depuis HN + Reddit.
 * Classification par contenu, hype score = engagement réel.
 * Fallback mockNews uniquement si TOUT échoue.
 * Cache in-memory de 5 min pour ne pas spammer les APIs.
 */
export async function getLiveNews(limitTotal = 30): Promise<NewsItem[]> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return _cache.items.slice(0, limitTotal)
  }

  const [hnAI, hnLLM, hnModels, hnBenchmarks, redditLLaMA, redditML] = await Promise.allSettled([
    fetchHN('artificial intelligence', 12),
    fetchHN('large language model', 8),
    fetchHN('OpenAI GPT Claude Gemini Llama', 8),
    fetchHN('benchmark AI evaluation', 6),
    fetchReddit('LocalLLaMA', 6, 'day'),
    fetchReddit('MachineLearning', 6, 'day'),
  ])

  const live: NewsItem[] = []
  if (hnAI.status === 'fulfilled') live.push(...hnAI.value)
  else console.warn('[feed] HN AI failed:', hnAI.reason)
  if (hnLLM.status === 'fulfilled') live.push(...hnLLM.value)
  else console.warn('[feed] HN LLM failed:', hnLLM.reason)
  if (hnModels.status === 'fulfilled') live.push(...hnModels.value)
  else console.warn('[feed] HN Models failed:', hnModels.reason)
  if (hnBenchmarks.status === 'fulfilled') live.push(...hnBenchmarks.value)
  else console.warn('[feed] HN Benchmarks failed:', hnBenchmarks.reason)
  if (redditLLaMA.status === 'fulfilled') live.push(...redditLLaMA.value)
  else console.warn('[feed] Reddit LocalLLaMA failed:', redditLLaMA.reason)
  if (redditML.status === 'fulfilled') live.push(...redditML.value)
  else console.warn('[feed] Reddit ML failed:', redditML.reason)

  if (live.length === 0) {
    return [...mockNews].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
  }

  const result = dedup(live)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 60) // cache plus pour éviter re-fetch

  _cache = { items: result, ts: Date.now() }
  return result.slice(0, limitTotal)
}

/**
 * Alias pour compatibilité — retourne les N news les plus récentes.
 */
export async function getEnrichedNews(limit = 20): Promise<NewsItem[]> {
  return getLiveNews(limit)
}
