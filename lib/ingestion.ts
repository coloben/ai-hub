import { mockModels, mockNews } from './mock-data'
import { Model, NewsItem } from './types'
import { dbUpsertNewsItems, dbInsertModelSnapshot, dbGetRecentNews } from './db'

export type SourceConnectorType = 'rss' | 'api' | 'manual'
export type SourceReliability = 'official' | 'independent' | 'community' | 'vendor'

export interface SourceConnector {
  id: string
  name: string
  url: string
  type: SourceConnectorType
  reliability: SourceReliability
  category: NewsItem['category']
  enabled: boolean
  requiresKey?: boolean
}

export interface IngestedItem extends NewsItem {
  connector_id: string
  raw_url: string
  verification_hint: SourceReliability
}

export interface ModelHistoryPoint {
  model_id: string
  model_name: string
  provider: string
  captured_at: string
  arena_elo: number | null
  price_input: number | null
  price_output: number | null
  rank: number
}

export interface IngestionRun {
  generated_at: string
  connectors: SourceConnector[]
  items: IngestedItem[]
  model_history: ModelHistoryPoint[]
  storage_mode: 'memory' | 'database-ready'
  next_database_steps: string[]
}

export const sourceConnectors: SourceConnector[] = [
  { id: 'openai-blog', name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', type: 'rss', reliability: 'official', category: 'release', enabled: true },
  { id: 'anthropic-news', name: 'Anthropic News', url: 'https://www.anthropic.com/news/rss.xml', type: 'rss', reliability: 'official', category: 'release', enabled: true },
  { id: 'google-ai', name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', type: 'rss', reliability: 'official', category: 'release', enabled: true },
  { id: 'meta-ai', name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/', type: 'rss', reliability: 'official', category: 'release', enabled: true },
  { id: 'mistral-news', name: 'Mistral AI', url: 'https://mistral.ai/news/rss.xml', type: 'rss', reliability: 'official', category: 'release', enabled: true },
  { id: 'huggingface-papers', name: 'HuggingFace Papers', url: 'https://huggingface.co/papers/rss', type: 'rss', reliability: 'community', category: 'research', enabled: true },
  { id: 'arxiv-ai', name: 'ArXiv cs.AI', url: 'https://export.arxiv.org/rss/cs.AI', type: 'rss', reliability: 'independent', category: 'research', enabled: true },
  { id: 'papers-with-code', name: 'Papers With Code', url: 'https://paperswithcode.com/rss', type: 'rss', reliability: 'independent', category: 'benchmark', enabled: true },
  { id: 'lmsys-arena', name: 'LMSYS Chatbot Arena', url: 'https://chat.lmsys.org/?leaderboard', type: 'manual', reliability: 'independent', category: 'benchmark', enabled: true },
  { id: 'artificial-analysis', name: 'Artificial Analysis', url: 'https://artificialanalysis.ai', type: 'api', reliability: 'independent', category: 'benchmark', enabled: true, requiresKey: true },
]

function stripXml(value: string): string {
  return value.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function getTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? stripXml(match[1]) : null
}

function inferTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  const tags = ['AI']
  ;['openai', 'anthropic', 'google', 'meta', 'mistral', 'benchmark', 'agent', 'code', 'multimodal', 'open-source', 'reasoning'].forEach(tag => {
    if (text.includes(tag.toLowerCase())) tags.push(tag)
  })
  return Array.from(new Set(tags)).slice(0, 5)
}

export async function fetchConnectorItems(connector: SourceConnector, limit = 6): Promise<IngestedItem[]> {
  if (connector.type !== 'rss') return []

  try {
    const response = await fetch(connector.url, { next: { revalidate: 900 } })
    if (!response.ok) return []
    const xml = await response.text()
    const chunks = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)).map(match => match[0]).slice(0, limit)

    return chunks.map((chunk, index) => {
      const title = getTag(chunk, 'title') ?? `${connector.name} update`
      const summary = getTag(chunk, 'description') ?? getTag(chunk, 'summary') ?? title
      const link = getTag(chunk, 'link') ?? connector.url
      const date = getTag(chunk, 'pubDate') ?? getTag(chunk, 'updated') ?? new Date().toISOString()
      const normalizedDate = Number.isNaN(new Date(date).getTime()) ? new Date().toISOString() : new Date(date).toISOString()

      return {
        id: `${connector.id}-${index}-${Buffer.from(title).toString('base64url').slice(0, 10)}`,
        title,
        summary: summary.slice(0, 280),
        source: connector.name,
        category: connector.category,
        published_at: normalizedDate,
        url: link,
        tags: inferTags(title, summary),
        is_breaking: index === 0 && connector.reliability === 'official',
        hype_score: connector.reliability === 'official' ? 78 : 64,
        connector_id: connector.id,
        raw_url: connector.url,
        verification_hint: connector.reliability,
      }
    })
  } catch {
    return []
  }
}

export async function runIngestion(limitPerSource = 4): Promise<IngestionRun> {
  const liveItems = (await Promise.all(sourceConnectors.filter(c => c.enabled).map(c => fetchConnectorItems(c, limitPerSource)))).flat()

  const fallbackItems: IngestedItem[] = mockNews.map(news => ({
    ...news,
    connector_id: `mock-${news.source.toLowerCase().replace(/\s+/g, '-')}`,
    raw_url: news.url,
    verification_hint: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'].includes(news.source) ? 'official' : 'independent',
  }))

  const itemsToStore = liveItems.length ? liveItems : fallbackItems
  const modelSnapshots = snapshotModelHistory(mockModels)

  await dbUpsertNewsItems(itemsToStore)
  await dbInsertModelSnapshot(modelSnapshots)

  const storedItems = await dbGetRecentNews(80)
  const finalItems: IngestedItem[] = storedItems.length
    ? storedItems.map(n => ({
        ...n,
        connector_id: `db-${n.source.toLowerCase().replace(/\s+/g, '-')}`,
        raw_url: n.url,
        verification_hint: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'].includes(n.source) ? 'official' : 'independent',
      }))
    : itemsToStore

  const storageMode: 'memory' | 'database-ready' = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? 'database-ready' : 'memory'

  return {
    generated_at: new Date().toISOString(),
    connectors: sourceConnectors,
    items: finalItems,
    model_history: modelSnapshots,
    storage_mode: storageMode,
    next_database_steps: storageMode === 'memory' ? [
      'Ajouter DATABASE_URL (Postgres/Neon) ou NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY dans .env.local',
      'Exécuter lib/schema.sql sur votre base pour créer les tables.',
      'Relancer le cron /api/cron — les données seront persistées automatiquement.',
    ] : [],
  }
}

export function snapshotModelHistory(models: Model[]): ModelHistoryPoint[] {
  const ranked = [...models].sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
  return ranked.map((model, index) => ({
    model_id: model.id,
    model_name: model.name,
    provider: model.provider,
    captured_at: new Date().toISOString(),
    arena_elo: model.scores.arena_elo,
    price_input: model.scores.price_input,
    price_output: model.scores.price_output,
    rank: index + 1,
  }))
}
