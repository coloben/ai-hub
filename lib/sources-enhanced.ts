// Enhanced Source Connectors for AI-Hub World Class
// 15+ verified sources with intelligent prioritization

import { SourceConnector, SourceConnectorType, SourceReliability } from './ingestion'

export type SourcePriority = 'critical' | 'high' | 'medium' | 'low'

export interface EnhancedSourceConnector extends SourceConnector {
  priority: SourcePriority
  description: string
  estimatedLatencyMs: number
  fallbackUrls?: string[]
  requiresAuth?: boolean
  healthCheckUrl?: string
  // category inherited from SourceConnector: 'research' | 'release' | 'benchmark' | 'industry'
  // We map our extended categories to these base types
}

export const enhancedSourceConnectors: EnhancedSourceConnector[] = [
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: CRITICAL - Official Labs (15min polling)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'openai-blog',
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'critical',
    description: 'Official OpenAI announcements, GPT releases, API updates',
    estimatedLatencyMs: 800,
    healthCheckUrl: 'https://openai.com/blog',
  },
  {
    id: 'anthropic-news',
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news/rss.xml',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'critical',
    description: 'Claude model releases, constitutional AI updates',
    estimatedLatencyMs: 900,
    fallbackUrls: ['https://www.anthropic.com/feed.xml'],
    healthCheckUrl: 'https://www.anthropic.com/news',
  },
  {
    id: 'google-ai',
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'critical',
    description: 'Google AI, DeepMind, Gemini announcements',
    estimatedLatencyMs: 700,
    fallbackUrls: ['https://ai.googleblog.com/feeds/posts/default'],
    healthCheckUrl: 'https://blog.google/technology/ai/',
  },
  {
    id: 'meta-ai',
    name: 'Meta AI',
    url: 'https://ai.meta.com/blog/rss/',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Meta AI research, Llama releases, FAIR updates',
    estimatedLatencyMs: 850,
    healthCheckUrl: 'https://ai.meta.com/blog/',
  },
  {
    id: 'mistral-news',
    name: 'Mistral AI',
    url: 'https://mistral.ai/news/rss.xml',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Mistral model releases, European AI leader',
    estimatedLatencyMs: 600,
    fallbackUrls: ['https://mistral.ai/feed'],
    healthCheckUrl: 'https://mistral.ai/news/',
  },
  {
    id: 'xai-grok',
    name: 'xAI',
    url: 'https://x.ai/api/rss',
    type: 'api',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Grok updates, xAI research',
    estimatedLatencyMs: 1200,
    requiresKey: true,
    healthCheckUrl: 'https://x.ai',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: BENCHMARKS - Live Rankings (15-30min polling)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'lmsys-arena',
    name: 'LMSYS Chatbot Arena',
    url: 'https://chat.lmsys.org/api/leaderboard',
    type: 'api',
    reliability: 'independent',
    category: 'benchmark',
    enabled: true,
    priority: 'critical',
    description: 'Live ELO rankings, crowd-sourced LLM evaluation',
    estimatedLatencyMs: 1500,
    requiresKey: false,
    healthCheckUrl: 'https://chat.lmsys.org',
  },
  {
    id: 'artificial-analysis',
    name: 'Artificial Analysis',
    url: 'https://artificialanalysis.ai/api/v1/models',
    type: 'api',
    reliability: 'independent',
    category: 'benchmark',
    enabled: true,
    priority: 'high',
    description: 'API pricing, quality benchmarks, provider comparison',
    estimatedLatencyMs: 2000,
    requiresKey: true,
    healthCheckUrl: 'https://artificialanalysis.ai',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/models',
    type: 'api',
    reliability: 'independent',
    category: 'pricing',
    enabled: true,
    priority: 'high',
    description: 'Unified API pricing, model availability',
    estimatedLatencyMs: 1800,
    requiresKey: false,
    healthCheckUrl: 'https://openrouter.ai',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: RESEARCH - Academic (1-2h polling)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'arxiv-ai',
    name: 'ArXiv cs.AI',
    url: 'https://export.arxiv.org/rss/cs.AI',
    type: 'rss',
    reliability: 'independent',
    category: 'research',
    enabled: true,
    priority: 'high',
    description: 'AI research papers, cutting-edge preprints',
    estimatedLatencyMs: 2500,
    fallbackUrls: ['http://rss.arxiv.org/rss/cs.AI'],
    healthCheckUrl: 'https://arxiv.org/list/cs.AI/recent',
  },
  {
    id: 'arxiv-ml',
    name: 'ArXiv cs.LG',
    url: 'https://export.arxiv.org/rss/cs.LG',
    type: 'rss',
    reliability: 'independent',
    category: 'research',
    enabled: true,
    priority: 'medium',
    description: 'Machine learning research papers',
    estimatedLatencyMs: 2500,
    healthCheckUrl: 'https://arxiv.org/list/cs.LG/recent',
  },
  {
    id: 'huggingface-papers',
    name: 'HuggingFace Papers',
    url: 'https://huggingface.co/papers/rss',
    type: 'rss',
    reliability: 'community',
    category: 'research',
    enabled: true,
    priority: 'high',
    description: 'Curated ML papers with community discussions',
    estimatedLatencyMs: 1100,
    healthCheckUrl: 'https://huggingface.co/papers',
  },
  {
    id: 'papers-with-code',
    name: 'Papers With Code',
    url: 'https://paperswithcode.com/rss',
    type: 'rss',
    reliability: 'independent',
    category: 'benchmark',
    enabled: true,
    priority: 'medium',
    description: 'SOTA results, benchmark leaderboards',
    estimatedLatencyMs: 1300,
    healthCheckUrl: 'https://paperswithcode.com',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: COMMUNITY & VEILLE (2-4h polling)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    url: 'https://www.deepseek.com/api/blog',
    type: 'api',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'medium',
    description: 'DeepSeek model releases, Chinese AI leader',
    estimatedLatencyMs: 2000,
    requiresKey: false,
    healthCheckUrl: 'https://www.deepseek.com',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    url: 'https://cohere.com/blog/rss.xml',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'medium',
    description: 'Cohere embeddings, command models',
    estimatedLatencyMs: 900,
    healthCheckUrl: 'https://cohere.com/blog',
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    url: 'https://www.ai21.com/blog/rss.xml',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: false, // Lower priority, opt-in
    priority: 'low',
    description: 'Jurassic models, AI21 updates',
    estimatedLatencyMs: 1000,
    healthCheckUrl: 'https://www.ai21.com/blog',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 5: SECURITY & SPECIALIZED
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'huggingface-security',
    name: 'HF Security Hub',
    url: 'https://huggingface.co/api/security/advisories',
    type: 'api',
    reliability: 'community',
    category: 'security',
    enabled: true,
    priority: 'high',
    description: 'Model security advisories, vulnerabilities',
    estimatedLatencyMs: 1500,
    requiresKey: false,
    healthCheckUrl: 'https://huggingface.co/docs/hub/security',
  },
]

// Source reliability scores (out of 100)
export const sourceReliabilityScores: Record<SourceReliability, number> = {
  official: 96,
  independent: 88,
  community: 75,
  vendor: 70,
}

// Get sources by priority tier
export function getSourcesByPriority(priority: SourcePriority): EnhancedSourceConnector[] {
  return enhancedSourceConnectors.filter(s => s.priority === priority && s.enabled)
}

// Get polling interval in minutes based on priority
export function getPollingInterval(priority: SourcePriority): number {
  switch (priority) {
    case 'critical': return 15
    case 'high': return 30
    case 'medium': return 60
    case 'low': return 240
  }
}

// Get connector by ID
export function getConnectorById(id: string): EnhancedSourceConnector | undefined {
  return enhancedSourceConnectors.find(c => c.id === id)
}

// Calculate source freshness score (0-100)
export function calculateSourceFreshness(
  lastUpdate: string | null,
  priority: SourcePriority
): number {
  if (!lastUpdate) return 0
  
  const elapsedMinutes = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60)
  const interval = getPollingInterval(priority)
  
  if (elapsedMinutes < interval * 0.5) return 100
  if (elapsedMinutes < interval) return 85
  if (elapsedMinutes < interval * 2) return 60
  if (elapsedMinutes < interval * 4) return 30
  return 0
}

// Export standard connectors for backward compatibility
export const sourceConnectorsV2: SourceConnector[] = enhancedSourceConnectors.map(c => ({
  id: c.id,
  name: c.name,
  url: c.url,
  type: c.type,
  reliability: c.reliability,
  category: c.category as any,
  enabled: c.enabled,
  requiresKey: c.requiresKey,
}))
