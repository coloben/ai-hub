/**
 * feed.ts — Source de vérité pour les news du site.
 *
 * Stratégie (sans DB) :
 *   1. Fetch les 10 connecteurs RSS réels en parallèle (Next.js ISR, revalidate 900s)
 *   2. Déduplique par titre normalisé
 *   3. Trie par date décroissante
 *   4. Si tous les flux échouent (réseau mort, CORS serveur…) → fallback mockNews
 *
 * Appelé uniquement côté serveur (Server Components / Route Handlers).
 */

import { NewsItem, NewsCategory } from './types'
import { mockNews } from './mock-data'

interface RssConnector {
  id: string
  name: string
  url: string
  category: NewsCategory
  reliability: 'official' | 'independent' | 'community'
}

const RSS_CONNECTORS: RssConnector[] = [
  { id: 'openai',      name: 'OpenAI',       url: 'https://openai.com/blog/rss.xml',                    category: 'release',   reliability: 'official'    },
  { id: 'anthropic',   name: 'Anthropic',    url: 'https://www.anthropic.com/news/rss.xml',              category: 'release',   reliability: 'official'    },
  { id: 'google-ai',   name: 'Google',       url: 'https://blog.google/technology/ai/rss/',              category: 'release',   reliability: 'official'    },
  { id: 'meta-ai',     name: 'Meta',         url: 'https://ai.meta.com/blog/rss/',                       category: 'release',   reliability: 'official'    },
  { id: 'mistral',     name: 'Mistral',      url: 'https://mistral.ai/news/rss.xml',                     category: 'release',   reliability: 'official'    },
  { id: 'hf-papers',   name: 'HuggingFace',  url: 'https://huggingface.co/papers/rss',                   category: 'research',  reliability: 'community'   },
  { id: 'arxiv',       name: 'ArXiv',        url: 'https://export.arxiv.org/rss/cs.AI',                  category: 'research',  reliability: 'independent' },
  { id: 'pwc',         name: 'Papers w/ Code', url: 'https://paperswithcode.com/rss',                    category: 'benchmark', reliability: 'independent' },
  { id: 'deepmind',    name: 'DeepMind',     url: 'https://deepmind.google/blog/rss.xml',                category: 'research',  reliability: 'official'    },
  { id: 'msft-ai',     name: 'Microsoft',    url: 'https://blogs.microsoft.com/ai/feed/',                category: 'industry',  reliability: 'official'    },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function getXmlTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? stripHtml(m[1]) : null
}

function inferTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  const candidates = [
    'openai', 'anthropic', 'google', 'meta', 'mistral', 'deepseek',
    'benchmark', 'agent', 'code', 'multimodal', 'open-source', 'reasoning',
    'gpt', 'claude', 'gemini', 'llama', 'grok',
  ]
  const found = candidates.filter(t => text.includes(t))
  return Array.from(new Set(['AI', ...found])).slice(0, 5)
}

function isBreaking(title: string, reliability: string, index: number): boolean {
  const urgent = /(launch|announce|release|new|introduces|unveil|dévoil|lance|nouveau)/i.test(title)
  return reliability === 'official' && index === 0 && urgent
}

function parseHupeScore(reliability: string, isBreak: boolean): number {
  const base = reliability === 'official' ? 72 : reliability === 'independent' ? 60 : 52
  return isBreak ? Math.min(100, base + 18) : base
}

// ── Fetch un connecteur RSS ───────────────────────────────────────────────────

async function fetchConnector(c: RssConnector, limit = 5): Promise<NewsItem[]> {
  try {
    const res = await fetch(c.url, {
      next: { revalidate: 900 },  // ISR 15 min
      headers: { 'User-Agent': 'AI-Hub/1.0 RSS-Reader' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items = Array.from(
      xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)
    ).map(m => m[0]).slice(0, limit)

    return items.map((chunk, i) => {
      const title    = getXmlTag(chunk, 'title') ?? `${c.name} update`
      const summary  = (getXmlTag(chunk, 'description') ?? getXmlTag(chunk, 'summary') ?? title).slice(0, 320)
      const url      = getXmlTag(chunk, 'link') ?? c.url
      const rawDate  = getXmlTag(chunk, 'pubDate') ?? getXmlTag(chunk, 'updated') ?? new Date().toISOString()
      const date     = isNaN(new Date(rawDate).getTime()) ? new Date().toISOString() : new Date(rawDate).toISOString()
      const breaking = isBreaking(title, c.reliability, i)

      return {
        id:           `${c.id}-${i}-${Buffer.from(title).toString('base64url').slice(0, 8)}`,
        title,
        summary,
        source:       c.name,
        category:     c.category,
        published_at: date,
        url,
        tags:         inferTags(title, summary),
        is_breaking:  breaking,
        hype_score:   parseHupeScore(c.reliability, breaking),
      } satisfies NewsItem
    })
  } catch {
    return []
  }
}

// ── Déduplique par titre normalisé ────────────────────────────────────────────

function dedup(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Export principal ──────────────────────────────────────────────────────────

/**
 * Retourne les news triées par date.
 * En production : données RSS réelles.
 * En dev sans réseau / si tous les flux échouent : mockNews.
 */
export async function getLiveNews(limitPerSource = 5): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_CONNECTORS.map(c => fetchConnector(c, limitPerSource))
  )

  const live = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  if (live.length === 0) {
    // Tous les flux ont échoué (pas de réseau serveur, CORS, etc.)
    return [...mockNews].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
  }

  return dedup(live).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )
}

/**
 * Retourne les N news les plus récentes avec enrichissement intelligence.
 */
export async function getEnrichedNews(limit = 20): Promise<NewsItem[]> {
  const news = await getLiveNews()
  return news.slice(0, limit)
}
