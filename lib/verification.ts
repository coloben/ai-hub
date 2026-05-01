import { NewsItem } from './types'
import { IngestedItem, sourceConnectors } from './ingestion'

export type VerificationStatus = 'confirmed' | 'watch' | 'unverified' | 'contradicted'

export interface VerificationResult {
  item: NewsItem
  status: VerificationStatus
  consensusScore: number
  confirmingSources: string[]
  contradictionSources: string[]
  badge: string
  rationale: string
}

function normalizeToken(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9à-ÿ\s-]/gi, ' ').split(/\s+/).filter(token => token.length > 3)
}

function similarity(a: NewsItem, b: NewsItem): number {
  const aTokens = new Set([...normalizeToken(a.title), ...a.tags.map(t => t.toLowerCase())])
  const bTokens = new Set([...normalizeToken(b.title), ...b.tags.map(t => t.toLowerCase())])
  const intersection = Array.from(aTokens).filter(token => bTokens.has(token)).length
  const union = new Set([...Array.from(aTokens), ...Array.from(bTokens)]).size
  return union ? intersection / union : 0
}

function sourceKind(source: string): 'official' | 'independent' | 'community' | 'vendor' {
  const connector = sourceConnectors.find(c => c.name.toLowerCase() === source.toLowerCase())
  if (connector) return connector.reliability
  if (['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Microsoft', 'Cohere'].includes(source)) return 'official'
  if (['ArXiv', 'Papers With Code', 'LMSYS Chatbot Arena', 'Artificial Analysis'].includes(source)) return 'independent'
  if (['HuggingFace'].includes(source)) return 'community'
  return 'independent'
}

export function verifyNewsItem(item: NewsItem, corpus: NewsItem[] | IngestedItem[]): VerificationResult {
  const related = corpus.filter(candidate => candidate.id !== item.id && similarity(item, candidate) >= 0.22)
  const confirmingSources = Array.from(new Set([item.source, ...related.map(r => r.source)]))
  const hasOfficial = confirmingSources.some(source => sourceKind(source) === 'official')
  const hasIndependent = confirmingSources.some(source => sourceKind(source) === 'independent' || sourceKind(source) === 'community')
  const contradictionSources = related.filter(candidate => {
    const text = `${candidate.title} ${candidate.summary}`.toLowerCase()
    return text.includes('dément') || text.includes('contradict') || text.includes('fake') || text.includes('rumor')
  }).map(candidate => candidate.source)
  const consensusScore = Math.min(100, Math.round(confirmingSources.length * 18 + (hasOfficial ? 28 : 0) + (hasIndependent ? 24 : 0) - contradictionSources.length * 35))

  if (contradictionSources.length > 0) {
    return {
      item,
      status: 'contradicted',
      consensusScore,
      confirmingSources,
      contradictionSources,
      badge: 'Contradiction détectée',
      rationale: 'Des sources proches semblent contredire le signal. Vérification éditoriale nécessaire.',
    }
  }

  if (hasOfficial && hasIndependent) {
    return {
      item,
      status: 'confirmed',
      consensusScore,
      confirmingSources,
      contradictionSources,
      badge: 'Confirmé',
      rationale: 'Signal recoupé entre une source officielle et au moins une source indépendante ou communautaire.',
    }
  }

  if (hasOfficial || confirmingSources.length >= 2) {
    return {
      item,
      status: 'watch',
      consensusScore,
      confirmingSources,
      contradictionSources,
      badge: 'À surveiller',
      rationale: 'Signal crédible mais pas encore assez recoupé pour être confirmé.',
    }
  }

  return {
    item,
    status: 'unverified',
    consensusScore,
    confirmingSources,
    contradictionSources,
    badge: 'À vérifier',
    rationale: 'Signal isolé ou provenant d’une source qui nécessite confirmation.',
  }
}

export function verifyCorpus(items: NewsItem[] | IngestedItem[]): VerificationResult[] {
  return items.map(item => verifyNewsItem(item, items)).sort((a, b) => b.consensusScore - a.consensusScore)
}
