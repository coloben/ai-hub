// Sources V2 - Liens vérifiés et fonctionnels
// Remplace les RSS morts par des sources réelles

import { SourceConnector, SourceConnectorType, SourceReliability } from './ingestion'

export type SourcePriority = 'critical' | 'high' | 'medium' | 'low'

export interface EnhancedSourceConnector extends SourceConnector {
  priority: SourcePriority
  description: string
  estimatedLatencyMs: number
  fallbackUrls?: string[]
  requiresAuth?: boolean
  healthCheckUrl?: string
  rssFeedUrl?: string
  twitterHandle?: string
  githubOrg?: string
}

// ═══════════════════════════════════════════════════════════════
// SOURCES VÉRIFIÉES ET FONCTIONNELLES
// ═══════════════════════════════════════════════════════════════

export const enhancedSourceConnectors: EnhancedSourceConnector[] = [
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: SOURCES OFFICIELLES (RSS/API vérifiés)
  // ═══════════════════════════════════════════════════════════════
  
  // HuggingFace - FONCTIONNEL ✓
  {
    id: 'huggingface-papers',
    name: 'HuggingFace Papers',
    url: 'https://huggingface.co/papers/rss',
    type: 'rss',
    reliability: 'community',
    category: 'research',
    enabled: true,
    priority: 'critical',
    description: 'Daily ML papers avec trending scores',
    estimatedLatencyMs: 800,
    rssFeedUrl: 'https://huggingface.co/papers/rss',
    healthCheckUrl: 'https://huggingface.co/papers',
  },
  
  // HuggingFace News - FONCTIONNEL ✓
  {
    id: 'huggingface-news',
    name: 'HuggingFace Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'rss',
    reliability: 'community',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'New models, datasets, transformers updates',
    estimatedLatencyMs: 900,
    rssFeedUrl: 'https://huggingface.co/blog/feed.xml',
    healthCheckUrl: 'https://huggingface.co/blog',
  },
  
  // ArXiv cs.AI - FONCTIONNEL ✓
  {
    id: 'arxiv-ai',
    name: 'ArXiv cs.AI',
    url: 'http://export.arxiv.org/rss/cs.AI',
    type: 'rss',
    reliability: 'independent',
    category: 'research',
    enabled: true,
    priority: 'high',
    description: 'AI research papers daily',
    estimatedLatencyMs: 1500,
    rssFeedUrl: 'http://export.arxiv.org/rss/cs.AI',
    fallbackUrls: ['https://r.jina.ai/http://export.arxiv.org/rss/cs.AI'],
    healthCheckUrl: 'https://arxiv.org/list/cs.AI/recent',
  },
  
  // ArXiv cs.LG - FONCTIONNEL ✓
  {
    id: 'arxiv-ml',
    name: 'ArXiv cs.LG',
    url: 'http://export.arxiv.org/rss/cs.LG',
    type: 'rss',
    reliability: 'independent',
    category: 'research',
    enabled: true,
    priority: 'medium',
    description: 'Machine learning research',
    estimatedLatencyMs: 1500,
    rssFeedUrl: 'http://export.arxiv.org/rss/cs.LG',
    healthCheckUrl: 'https://arxiv.org/list/cs.LG/recent',
  },
  
  // ArXiv cs.CL (NLP) - FONCTIONNEL ✓
  {
    id: 'arxiv-nlp',
    name: 'ArXiv cs.CL',
    url: 'http://export.arxiv.org/rss/cs.CL',
    type: 'rss',
    reliability: 'independent',
    category: 'research',
    enabled: true,
    priority: 'medium',
    description: 'NLP and computational linguistics',
    estimatedLatencyMs: 1500,
    rssFeedUrl: 'http://export.arxiv.org/rss/cs.CL',
    healthCheckUrl: 'https://arxiv.org/list/cs.CL/recent',
  },
  
  // Google AI - FONCTIONNEL ✓
  {
    id: 'google-ai',
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'critical',
    description: 'Google AI, DeepMind, Gemini updates',
    estimatedLatencyMs: 1000,
    rssFeedUrl: 'https://blog.google/technology/ai/rss/',
    fallbackUrls: ['https://r.jina.ai/http://ai.googleblog.com/feeds/posts/default'],
    healthCheckUrl: 'https://blog.google/technology/ai/',
  },
  
  // Meta AI - FONCTIONNEL ✓
  {
    id: 'meta-ai',
    name: 'Meta AI Research',
    url: 'https://ai.meta.com/blog/rss/',
    type: 'rss',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Meta AI research, Llama releases',
    estimatedLatencyMs: 1100,
    rssFeedUrl: 'https://ai.meta.com/blog/rss/',
    healthCheckUrl: 'https://ai.meta.com/blog/',
  },
  
  // Microsoft Research - FONCTIONNEL ✓
  {
    id: 'microsoft-research',
    name: 'Microsoft Research',
    url: 'https://www.microsoft.com/en-us/research/research-area/artificial-intelligence/rss/',
    type: 'rss',
    reliability: 'official',
    category: 'research',
    enabled: true,
    priority: 'high',
    description: 'Microsoft AI research, Copilot updates',
    estimatedLatencyMs: 1200,
    rssFeedUrl: 'https://www.microsoft.com/en-us/research/research-area/artificial-intelligence/rss/',
    healthCheckUrl: 'https://www.microsoft.com/en-us/research/research-area/artificial-intelligence/',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 2: SOURCES SPÉCIALISÉES MODÈLES
  // ═══════════════════════════════════════════════════════════════
  
  // GitHub Trending AI - Via RSS proxy
  {
    id: 'github-trending-ai',
    name: 'GitHub Trending AI',
    url: 'https://r.jina.ai/http://github.com/trending/python?since=daily',
    type: 'api',
    reliability: 'community',
    category: 'release',
    enabled: true,
    priority: 'medium',
    description: 'Trending AI repos, new model releases',
    estimatedLatencyMs: 2000,
    healthCheckUrl: 'https://github.com/trending/python',
  },
  
  // Reddit r/LocalLLaMA - FONCTIONNEL ✓
  {
    id: 'reddit-localllama',
    name: 'r/LocalLLaMA',
    url: 'https://www.reddit.com/r/LocalLLaMA/new/.rss',
    type: 'rss',
    reliability: 'community',
    category: 'community',
    enabled: true,
    priority: 'high',
    description: 'Local LLM community, new model announcements',
    estimatedLatencyMs: 1800,
    rssFeedUrl: 'https://www.reddit.com/r/LocalLLaMA/new/.rss',
    healthCheckUrl: 'https://reddit.com/r/LocalLLaMA',
  },
  
  // Reddit r/MachineLearning - FONCTIONNEL ✓
  {
    id: 'reddit-ml',
    name: 'r/MachineLearning',
    url: 'https://www.reddit.com/r/MachineLearning/new/.rss',
    type: 'rss',
    reliability: 'community',
    category: 'research',
    enabled: true,
    priority: 'medium',
    description: 'ML research discussions, paper releases',
    estimatedLatencyMs: 1800,
    rssFeedUrl: 'https://www.reddit.com/r/MachineLearning/new/.rss',
    healthCheckUrl: 'https://reddit.com/r/MachineLearning',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 3: BENCHMARKS ET DONNÉES
  // ═══════════════════════════════════════════════════════════════
  
  // LMSYS Arena - API directe
  {
    id: 'lmsys-arena',
    name: 'LMSYS Chatbot Arena',
    url: 'https://chat.lmsys.org/',
    type: 'manual',
    reliability: 'independent',
    category: 'benchmark',
    enabled: true,
    priority: 'critical',
    description: 'Live ELO rankings, crowd-sourced LLM eval',
    estimatedLatencyMs: 1500,
    healthCheckUrl: 'https://chat.lmsys.org/',
  },
  
  // SEMLAB (ranks.ai) - Alternative leaderboard
  {
    id: 'semab-ranks',
    name: 'SEMAB AI Ranks',
    url: 'https://ranks.ai/leaderboard',
    type: 'manual',
    reliability: 'independent',
    category: 'benchmark',
    enabled: true,
    priority: 'high',
    description: 'Alternative model rankings with pricing',
    estimatedLatencyMs: 1500,
    healthCheckUrl: 'https://ranks.ai',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 4: SOURCES CHINOISES (DeepSeek, Qwen, GLM)
  // ═══════════════════════════════════════════════════════════════
  
  // DeepSeek - GitHub releases
  {
    id: 'deepseek-github',
    name: 'DeepSeek AI',
    url: 'https://github.com/deepseek-ai',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'DeepSeek V4, DeepSeek Coder releases',
    estimatedLatencyMs: 2000,
    githubOrg: 'deepseek-ai',
    healthCheckUrl: 'https://github.com/deepseek-ai',
  },
  
  // Qwen (Alibaba) - GitHub releases
  {
    id: 'qwen-github',
    name: 'Qwen (Alibaba)',
    url: 'https://github.com/QwenLM',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Qwen 2.5, Qwen Coder, multimodal models',
    estimatedLatencyMs: 2000,
    githubOrg: 'QwenLM',
    healthCheckUrl: 'https://github.com/QwenLM',
  },
  
  // ChatGLM (Zhipu AI) - GitHub releases
  {
    id: 'chatglm-github',
    name: 'ChatGLM (Zhipu)',
    url: 'https://github.com/THUDM',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'GLM-4, ChatGLM3, CodeGeeX releases',
    estimatedLatencyMs: 2000,
    githubOrg: 'THUDM',
    healthCheckUrl: 'https://github.com/THUDM',
  },
  
  // Moonshot AI (Kimi) - Site officiel
  {
    id: 'moonshot-kimi',
    name: 'Moonshot AI (Kimi)',
    url: 'https://www.moonshot.cn/news',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Kimi K1.5, Kimi Chat, long-context models',
    estimatedLatencyMs: 2500,
    healthCheckUrl: 'https://www.moonshot.cn',
  },
  
  // 01.AI (Yi Models) - GitHub
  {
    id: 'yi-github',
    name: '01.AI (Yi)',
    url: 'https://github.com/01-ai',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'medium',
    description: 'Yi-34B, Yi-Vision, Yi-Coder models',
    estimatedLatencyMs: 2000,
    githubOrg: '01-ai',
    healthCheckUrl: 'https://github.com/01-ai',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 5: AUTRES LABORATOIRES
  // ═══════════════════════════════════════════════════════════════
  
  // Cohere - Site + GitHub
  {
    id: 'cohere',
    name: 'Cohere',
    url: 'https://cohere.com/blog',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'medium',
    description: 'Command R+, Cohere Embed, Aya models',
    estimatedLatencyMs: 1500,
    healthCheckUrl: 'https://cohere.com/blog',
  },
  
  // AI21 Labs
  {
    id: 'ai21',
    name: 'AI21 Labs',
    url: 'https://studio.ai21.com',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: false, // Moins prioritaire
    priority: 'low',
    description: 'Jurassic-2 models',
    estimatedLatencyMs: 2000,
    healthCheckUrl: 'https://studio.ai21.com',
  },
  
  // Mistral - Via site (pas de RSS officiel)
  {
    id: 'mistral-news',
    name: 'Mistral AI',
    url: 'https://mistral.ai/news/',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'high',
    description: 'Mistral Large, Mixtral, Codestral releases',
    estimatedLatencyMs: 1500,
    twitterHandle: '@MistralAI',
    healthCheckUrl: 'https://mistral.ai/news/',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 6: VEILLE ET SÉCURITÉ
  // ═══════════════════════════════════════════════════════════════
  
  // HuggingFace Security
  {
    id: 'hf-security',
    name: 'HF Security',
    url: 'https://huggingface.co/docs/hub/security',
    type: 'manual',
    reliability: 'community',
    category: 'security',
    enabled: true,
    priority: 'medium',
    description: 'Model security advisories',
    estimatedLatencyMs: 2000,
    healthCheckUrl: 'https://huggingface.co/docs/hub/security',
  },
  
  // OpenAI - Site direct (pas de RSS public)
  {
    id: 'openai-news',
    name: 'OpenAI',
    url: 'https://openai.com/news/',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'critical',
    description: 'GPT-4o, o1, o3, API updates',
    estimatedLatencyMs: 1500,
    twitterHandle: '@OpenAI',
    healthCheckUrl: 'https://openai.com/news/',
  },
  
  // Anthropic - Site direct (pas de RSS public)
  {
    id: 'anthropic-news',
    name: 'Anthropic',
    url: 'https://www.anthropic.com/news',
    type: 'manual',
    reliability: 'official',
    category: 'release',
    enabled: true,
    priority: 'critical',
    description: 'Claude 3.5, 3.7 Sonnet, Opus releases',
    estimatedLatencyMs: 1500,
    twitterHandle: '@AnthropicAI',
    healthCheckUrl: 'https://www.anthropic.com/news',
  },
]

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

// Source reliability scores
export const sourceReliabilityScores: Record<SourceReliability, number> = {
  official: 96,
  independent: 88,
  community: 75,
  vendor: 70,
}

// Get sources by priority
export function getSourcesByPriority(priority: SourcePriority): EnhancedSourceConnector[] {
  return enhancedSourceConnectors.filter(s => s.priority === priority && s.enabled)
}

// Get polling interval
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

// Calculate freshness score
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
