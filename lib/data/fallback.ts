import {
  ArenaModelSchema,
  FeedPostSchema,
  RankingDataSchema,
  FeedDataSchema,
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

/** Honest placeholder when arXiv/HF are down — no fake corporate posts */
export function getUnavailableFeed(): FeedData {
  const now = new Date().toISOString()
  const post = FeedPostSchema.parse({
    id: 'feed-unavailable',
    author: 'AI Hub',
    handle: 'system',
    time: '< 1 h',
    title: 'Flux actualités temporairement indisponibles',
    content:
      'Les sources arXiv (cs.AI) et Hugging Face Papers ne répondent pas. Aucune fausse actualité n\'est affichée. Réessayez dans quelques minutes ou consultez le classement Arena.',
    tags: ['system'],
    votes: 0,
    comments: 0,
    shares: 0,
    badge: 'Secours',
    type: 'news' as const,
    publishedAt: now,
  })
  return FeedDataSchema.parse({
    posts: [post],
    updatedAt: now,
    sources: ['feed-unavailable'],
    feedTier: 'unavailable',
  })
}
