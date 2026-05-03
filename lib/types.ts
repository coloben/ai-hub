export type NewsCategory = 'research' | 'release' | 'benchmark' | 'industry' | 'pricing' | 'security' | 'community'

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  source_logo?: string
  category: NewsCategory
  published_at: string
  url: string
  tags: string[]
  is_breaking: boolean
  hype_score: number
  // Enrichment fields
  sentiment?: 'positive' | 'negative' | 'neutral'
  entities?: string[] // Models, companies, benchmarks mentioned
  confidence_score?: number // 0-100
}

export interface ModelScores {
  arena_elo: number | null
  mmlu: number | null
  humaneval: number | null
  math: number | null
  gpqa: number | null
  speed_tps: number | null
  price_input: number | null
  price_output: number | null
}

export type ModelSubcategory = 
  | 'code'        // Programmation
  | 'vision'      // Imagerie / multimodal visuel
  | 'agent'       // Agents autonomes
  | 'reasoning'   // Raisonnement avancé
  | 'chat'        // Conversation générale
  | 'audio'       // Voix / audio
  | 'embedding'   // Embeddings / recherche
  | 'specialized' // Médical, juridique, finance...

export interface Model {
  id: string
  name: string
  provider: string
  type: 'proprietary' | 'open'
  subcategory: ModelSubcategory
  subcategory_label: string
  scores: ModelScores
  context_window: number
  parameters?: string
  release_date: string
  changelog_url: string
  is_new: boolean
  rank_delta_7d: number
  description?: string
  best_for?: string[]
  api_available: boolean
}

export interface BenchmarkMatrix {
  benchmarks: string[]
  models: string[]
  matrix: (number | null)[][]
  last_updated: string
}

export interface SearchResult {
  type: 'news' | 'model'
  id: string
  title: string
  excerpt: string
  url: string
}

export interface CronResponse {
  refreshed: string[]
  errors: string[]
  duration_ms: number
}

export interface FeedResponse {
  items: NewsItem[]
  total: number
  last_updated: string
}

export interface ModelsResponse {
  models: Model[]
  last_updated: string
}
