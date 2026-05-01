import { mockModels, mockNews } from './mock-data'
import { Model, NewsItem } from './types'

export type IntelligenceSeverity = 'critical' | 'high' | 'medium' | 'low'
export type IntelligenceSignalType = 'release' | 'benchmark' | 'market' | 'research' | 'pricing' | 'open_source'

export interface SourceProfile {
  name: string
  credibility: number
  type: 'official' | 'research' | 'media' | 'community'
  bias: 'vendor' | 'academic' | 'journalistic' | 'community'
}

export interface NewsIntelligence {
  news: NewsItem
  confidence: number
  impact: number
  freshness: number
  severity: IntelligenceSeverity
  signalType: IntelligenceSignalType
  whyItMatters: string
  action: string
}

export interface ModelIntelligence {
  model: Model
  overallScore: number
  valueScore: number
  capabilityScore: number
  productionReadiness: number
  recommendation: string
  risk: string
}

export interface IntelligenceBriefing {
  generated_at: string
  marketHeat: number
  sourceCoverage: number
  topSignals: NewsIntelligence[]
  modelRecommendations: ModelIntelligence[]
  watchlist: string[]
  gaps: string[]
}

export const sourceProfiles: SourceProfile[] = [
  { name: 'OpenAI', credibility: 92, type: 'official', bias: 'vendor' },
  { name: 'Anthropic', credibility: 92, type: 'official', bias: 'vendor' },
  { name: 'Google', credibility: 90, type: 'official', bias: 'vendor' },
  { name: 'Meta', credibility: 88, type: 'official', bias: 'vendor' },
  { name: 'Mistral', credibility: 86, type: 'official', bias: 'vendor' },
  { name: 'xAI', credibility: 80, type: 'official', bias: 'vendor' },
  { name: 'DeepSeek', credibility: 82, type: 'official', bias: 'vendor' },
  { name: 'Alibaba', credibility: 82, type: 'official', bias: 'vendor' },
  { name: 'Microsoft', credibility: 88, type: 'official', bias: 'vendor' },
  { name: 'HuggingFace', credibility: 84, type: 'community', bias: 'community' },
  { name: 'ArXiv', credibility: 78, type: 'research', bias: 'academic' },
  { name: 'MIT Tech Review', credibility: 82, type: 'media', bias: 'journalistic' },
  { name: 'VentureBeat', credibility: 72, type: 'media', bias: 'journalistic' },
  { name: 'The Verge', credibility: 70, type: 'media', bias: 'journalistic' },
  { name: 'Cohere', credibility: 84, type: 'official', bias: 'vendor' },
]

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function getSourceProfile(source: string): SourceProfile {
  return sourceProfiles.find(s => s.name.toLowerCase() === source.toLowerCase()) ?? {
    name: source,
    credibility: 60,
    type: 'media',
    bias: 'journalistic',
  }
}

function getFreshnessScore(date: string): number {
  const ageHours = Math.max(0, (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60))
  if (ageHours <= 6) return 100
  if (ageHours <= 24) return 90
  if (ageHours <= 72) return 76
  if (ageHours <= 168) return 58
  return 38
}

function inferSignalType(news: NewsItem): IntelligenceSignalType {
  if (news.category === 'benchmark') return 'benchmark'
  if (news.category === 'research') return 'research'
  if (news.tags.some(t => ['open-source', 'libre', 'Llama', 'DeepSeek'].includes(t))) return 'open_source'
  if (news.tags.some(t => ['prix', 'économique'].includes(t))) return 'pricing'
  if (news.category === 'industry') return 'market'
  return 'release'
}

function getSeverity(impact: number): IntelligenceSeverity {
  if (impact >= 88) return 'critical'
  if (impact >= 75) return 'high'
  if (impact >= 58) return 'medium'
  return 'low'
}

function buildWhyItMatters(news: NewsItem, type: IntelligenceSignalType): string {
  if (type === 'benchmark') return 'Ce signal modifie la façon d’évaluer les modèles et peut changer les classements.'
  if (type === 'pricing') return 'Ce signal peut réduire les coûts de production et changer le choix du modèle en entreprise.'
  if (type === 'open_source') return 'Ce signal renforce l’auto-hébergement, la souveraineté et la baisse de dépendance aux APIs propriétaires.'
  if (type === 'research') return 'Ce signal peut annoncer une nouvelle capacité avant son adoption marché.'
  if (type === 'market') return 'Ce signal indique une évolution d’adoption, de stratégie ou de positionnement concurrentiel.'
  return 'Ce signal peut déplacer l’état de l’art et influencer le choix des modèles à court terme.'
}

function buildAction(news: NewsItem, type: IntelligenceSignalType): string {
  if (type === 'benchmark') return 'Comparer immédiatement les modèles concernés dans les benchmarks.'
  if (type === 'pricing') return 'Simuler le coût API et vérifier le gain sur vos volumes réels.'
  if (type === 'open_source') return 'Évaluer une option self-hosted ou un fine-tuning interne.'
  if (type === 'research') return 'Surveiller les implémentations open-source et les reproductions indépendantes.'
  if (news.tags.includes('agent')) return 'Tester sur un workflow réel avec permissions limitées.'
  return 'Ajouter à la watchlist et comparer contre votre modèle actuel.'
}

export function enrichNews(news: NewsItem): NewsIntelligence {
  const source = getSourceProfile(news.source)
  const freshness = getFreshnessScore(news.published_at)
  const signalType = inferSignalType(news)
  const officialBoost = source.type === 'official' ? 8 : 0
  const benchmarkBoost = news.category === 'benchmark' ? 6 : 0
  const confidence = clamp(source.credibility * 0.72 + freshness * 0.18 + officialBoost + benchmarkBoost)
  const impact = clamp(news.hype_score * 0.58 + confidence * 0.26 + freshness * 0.16)

  return {
    news,
    confidence,
    impact,
    freshness,
    severity: getSeverity(impact),
    signalType,
    whyItMatters: buildWhyItMatters(news, signalType),
    action: buildAction(news, signalType),
  }
}

export function enrichModel(model: Model): ModelIntelligence {
  const scores = model.scores
  const capabilityMetrics = [scores.arena_elo, scores.mmlu, scores.humaneval, scores.math, scores.gpqa].filter((v): v is number => v !== null)
  const normalizedCapability = capabilityMetrics.length
    ? capabilityMetrics.reduce((acc, value) => acc + (value > 200 ? value / 14 : value), 0) / capabilityMetrics.length
    : 45
  const speed = scores.speed_tps ? Math.min(100, scores.speed_tps / 2) : 45
  const price = scores.price_input && scores.price_output
    ? Math.max(10, 100 - (scores.price_input + scores.price_output) * 1.2)
    : model.type === 'open' ? 88 : 50
  const context = Math.min(100, model.context_window / 20000)
  const capabilityScore = clamp(normalizedCapability)
  const valueScore = clamp(price * 0.55 + speed * 0.25 + context * 0.2)
  const productionReadiness = clamp((model.api_available ? 18 : 8) + capabilityScore * 0.42 + valueScore * 0.28 + (model.type === 'open' ? 8 : 12))
  const overallScore = clamp(capabilityScore * 0.48 + valueScore * 0.24 + productionReadiness * 0.28)

  return {
    model,
    overallScore,
    valueScore,
    capabilityScore,
    productionReadiness,
    recommendation: overallScore >= 85 ? 'Leader à évaluer en priorité' : overallScore >= 72 ? 'Très bon candidat selon le cas d’usage' : 'À réserver à des besoins spécifiques',
    risk: model.type === 'open' ? 'Coût infra et maintenance à prévoir' : 'Dépendance API, prix et confidentialité à surveiller',
  }
}

export function generateBriefing(): IntelligenceBriefing {
  const enrichedNews = mockNews.map(enrichNews).sort((a, b) => b.impact - a.impact)
  const enrichedModels = mockModels.map(enrichModel).sort((a, b) => b.overallScore - a.overallScore)
  const marketHeat = clamp(enrichedNews.reduce((acc, item) => acc + item.impact, 0) / enrichedNews.length)
  const uniqueSources = new Set(mockNews.map(n => n.source)).size
  const sourceCoverage = clamp((uniqueSources / sourceProfiles.length) * 100)

  return {
    generated_at: new Date().toISOString(),
    marketHeat,
    sourceCoverage,
    topSignals: enrichedNews.slice(0, 8),
    modelRecommendations: enrichedModels.slice(0, 8),
    watchlist: enrichedNews.filter(n => n.severity === 'critical' || n.severity === 'high').slice(0, 5).map(n => n.news.title),
    gaps: [
      'Connecter de vrais flux RSS/API au lieu du mock-data.',
      'Ajouter validation multi-source avant badge “confirmé”.',
      'Stocker l’historique des scores pour détecter les mouvements réels.',
      'Ajouter une base utilisateur pour watchlists et alertes personnalisées.',
    ],
  }
}
