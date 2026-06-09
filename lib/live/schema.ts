export interface CommunityModelRank {
  modelId: string
  wins: number
  losses: number
  duels: number
  winRate: number
  /** Bradley-Terry style score 1000 + win% bonus for sort stability */
  communityScore: number
}

export interface SocialPlatformStats {
  communityPostCount: number
  totalPostVotes: number
  totalPostScore: number
}

export interface LivePlatformSnapshot {
  generatedAt: string
  community: {
    totalDuelVotes: number
    uniqueVoters: number
    votesByCategory: Record<string, number>
    persisted: boolean
  }
  social: SocialPlatformStats
  leaderboard: CommunityModelRank[]
  arena: {
    modelCount: number
    votesTotal: number
    source: string
    updatedAt: string
    topModel: string | null
    topElo: number | null
  }
}
