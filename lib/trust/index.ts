import type { RankingData } from '@/lib/data/schema'
import { getRanking } from '@/lib/data/pipeline'
import { hasDatabase } from '@/lib/db'

export type DataTier = 'live' | 'cached' | 'fallback'

export interface TrustStatus {
  tier: DataTier
  rankingSource: string
  rankingUpdatedAt: string
  arenaLeaderboardUrl: string
  databaseConfigured: boolean
  message: string
}

export function classifyRankingSource(source: string): DataTier {
  if (source === 'arena-ai') return 'live'
  if (source.includes('fallback')) return 'fallback'
  return 'cached'
}

export function trustMessage(tier: DataTier): string {
  switch (tier) {
    case 'live':
      return 'Classement synchronisé avec le miroir public Arena AI. Les chiffres ELO et votes Arena sont vérifiables sur lmarena.ai.'
    case 'cached':
      return 'Données en cache (rafraîchissement toutes les 5 minutes).'
    case 'fallback':
      return 'Arena AI temporairement indisponible — classement de secours (snapshot statique). Vérifiez la date de MAJ affichée. Les votes communautaires du site restent réels si DATABASE_URL est configuré.'
  }
}

export async function getTrustStatus(): Promise<TrustStatus> {
  const ranking = await getRanking()
  const tier = classifyRankingSource(ranking.source)
  return {
    tier,
    rankingSource: ranking.source,
    rankingUpdatedAt: ranking.updatedAt,
    arenaLeaderboardUrl: 'https://lmarena.ai/leaderboard',
    databaseConfigured: hasDatabase(),
    message: trustMessage(tier),
  }
}

export function rankingFromData(ranking: RankingData): TrustStatus {
  const tier = classifyRankingSource(ranking.source)
  return {
    tier,
    rankingSource: ranking.source,
    rankingUpdatedAt: ranking.updatedAt,
    arenaLeaderboardUrl: 'https://lmarena.ai/leaderboard',
    databaseConfigured: hasDatabase(),
    message: trustMessage(tier),
  }
}

export const ARENA_ATTRIBUTION =
  'ELO et volume « votes Arena » : Chatbot Arena (LMSYS) — duels humains agrégés, pas des votes AI Hub.'

export const COMMUNITY_ATTRIBUTION =
  'Votes du comparateur : enregistrés sur AI Hub (1 vote par navigateur et par paire), agrégés en taux A/B.'
