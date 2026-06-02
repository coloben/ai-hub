import {
  ArenaModelSchema,
  FeedPostSchema,
  RankingDataSchema,
  FeedDataSchema,
  type ArenaModel,
  type FeedPost,
  type RankingData,
  type FeedData,
} from './schema'

/* ── Fallback Ranking (Arena AI data, May 2026) ──────────────────────── */

const FALLBACK_MODELS_RAW = [
  { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4 (thinking)', organization: 'Anthropic', elo: 1502, eloDelta: 0, samples: 34186, category: 'proprietary' as const },
  { id: 'claude-opus-4-7-thinking', name: 'Claude Opus 4.7 (thinking)', organization: 'Anthropic', elo: 1500, eloDelta: 0, samples: 19973, category: 'proprietary' as const },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4', organization: 'Anthropic', elo: 1498, eloDelta: 0, samples: 36512, category: 'proprietary' as const },
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', organization: 'Anthropic', elo: 1494, eloDelta: 0, samples: 20724, category: 'proprietary' as const },
  { id: 'muse-spark', name: 'Muse Spark', organization: 'Meta', elo: 1489, eloDelta: 0, samples: 12228, category: 'open-weight' as const },
  { id: 'gemini-3-1-pro-preview', name: 'Gemini 3.1 Pro Preview', organization: 'Google', elo: 1487, eloDelta: 0, samples: 43742, category: 'proprietary' as const },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', organization: 'Google', elo: 1486, eloDelta: 0, samples: 41332, category: 'proprietary' as const },
  { id: 'gpt-5-5-high', name: 'GPT-5.5 High', organization: 'OpenAI', elo: 1482, eloDelta: 0, samples: 16573, category: 'proprietary' as const },
  { id: 'gpt-5-4-high', name: 'GPT-5.4 High', organization: 'OpenAI', elo: 1480, eloDelta: 0, samples: 28246, category: 'proprietary' as const },
  { id: 'gemini-3-5-flash', name: 'Gemini 3.5 Flash', organization: 'Google', elo: 1479, eloDelta: 0, samples: 9045, category: 'proprietary' as const },
  { id: 'gpt-5-5', name: 'GPT-5.5', organization: 'OpenAI', elo: 1476, eloDelta: 0, samples: 16852, category: 'proprietary' as const },
  { id: 'grok-4-20-beta1', name: 'Grok 4.20 Beta1', organization: 'xAI', elo: 1476, eloDelta: 0, samples: 24468, category: 'proprietary' as const },
  { id: 'qwen3-7-max-preview', name: 'Qwen 3.7 Max Preview', organization: 'Alibaba', elo: 1475, eloDelta: 0, samples: 3755, category: 'open-weight' as const },
  { id: 'deepseek-r2', name: 'DeepSeek R2', organization: 'DeepSeek', elo: 1470, eloDelta: 0, samples: 18200, category: 'open-weight' as const },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', organization: 'Meta', elo: 1465, eloDelta: 0, samples: 15000, category: 'open-weight' as const },
]

export function getFallbackRanking(): RankingData {
  const now = new Date().toISOString()
  const models = FALLBACK_MODELS_RAW.map((m) =>
    ArenaModelSchema.parse({ ...m, updatedAt: now })
  )
  return RankingDataSchema.parse({
    models,
    updatedAt: now,
    source: 'arena-ai-fallback',
  })
}

/* ── Fallback Feed (actualités curées) ─────────────────────────────────── */

const FALLBACK_POSTS_RAW = [
  {
    id: 'fb-1', author: 'Arena AI', handle: 'arena_ai', time: '2 h',
    title: 'Claude Opus 4 prend la tête du Chatbot Arena avec 1502 ELO',
    content: 'Anthropic domine le classement avec ses modèles thinking. Claude Opus 4.7 thinking suit de près à 1500 ELO. La famille Claude occupe les 4 premières places.',
    tags: ['claude', 'elo', 'arena'], votes: 847, comments: 156, shares: 89,
    badge: 'Benchmark', type: 'benchmark' as const,
  },
  {
    id: 'fb-2', author: 'Google DeepMind', handle: 'deepmind', time: '5 h',
    title: 'Gemini 3.1 Pro Preview : nouveau challenger sur l\'Arena',
    content: 'Google présente Gemini 3.1 Pro Preview à 1487 ELO. Performances en hausse sur le raisonnement et le code. Disponible via API.',
    tags: ['gemini', 'google', 'release'], votes: 2100, comments: 518, shares: 445,
    badge: 'Official', type: 'news' as const,
  },
  {
    id: 'fb-3', author: 'OpenAI', handle: 'openai', time: '8 h',
    title: 'GPT-5.5 High atteint 1482 ELO sur l\'Arena',
    content: 'OpenAI lance GPT-5.5 High avec des capacités de raisonnement améliorées. Le modèle se positionne dans le top 10 du classement Arena.',
    tags: ['openai', 'gpt', 'release'], votes: 4200, comments: 1100, shares: 2300,
    badge: 'Release', type: 'news' as const,
  },
  {
    id: 'fb-4', author: 'Meta AI', handle: 'metaai', time: '12 h',
    title: 'Muse Spark : le modèle open-weight de Meta à 1489 ELO',
    content: 'Meta libère Muse Spark, un modèle open-weight qui se classe 5ème sur l\'Arena. Architecture MoE avec des performances impressionnantes pour un modèle ouvert.',
    tags: ['meta', 'muse', 'open-source'], votes: 3400, comments: 892, shares: 1100,
    badge: 'Release', type: 'news' as const,
  },
  {
    id: 'fb-5', author: 'xAI', handle: 'xai', time: '6 h',
    title: 'Grok 4.20 Beta1 entre dans le top 10 Arena',
    content: 'Le dernier modèle de xAI atteint 1476 ELO. Améliorations notables en raisonnement et en code. Disponible sur X et via API.',
    tags: ['grok', 'xai', 'benchmark'], votes: 1200, comments: 342, shares: 201,
    badge: 'Benchmark', type: 'benchmark' as const,
  },
  {
    id: 'fb-6', author: 'DeepSeek', handle: 'deepseek', time: '3 h',
    title: 'DeepSeek R2 : le modèle de raisonnement open-weight à 1470 ELO',
    content: 'DeepSeek R2 propose des capacités de raisonnement avancées en open-weight. Le modèle rivalise avec les offres propriétaires sur plusieurs benchmarks.',
    tags: ['deepseek', 'reasoning', 'open-weight'], votes: 3100, comments: 620, shares: 890,
    badge: 'Research', type: 'news' as const,
  },
]

export function getFallbackFeed(): FeedData {
  const now = new Date().toISOString()
  const posts = FALLBACK_POSTS_RAW.map((p) => FeedPostSchema.parse({ ...p }))
  return FeedDataSchema.parse({
    posts,
    updatedAt: now,
    sources: ['manual-curation'],
  })
}
