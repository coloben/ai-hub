'use client'

import { useCallback, useEffect, useState } from 'react'
import { LIVE_STATS_BUMP } from '@/lib/live/events'

export interface LiveStatsApiResponse {
  ok: boolean
  generatedAt: string
  community: {
    totalDuelVotes: number
    uniqueVoters: number
    votesByCategory: Record<string, number>
    persisted: boolean
  }
  social: {
    communityPostCount: number
    totalPostVotes: number
    totalPostScore: number
  }
  leaderboard: Array<{
    modelId: string
    wins: number
    losses: number
    duels: number
    winRate: number
    communityScore: number
  }>
  arena: {
    modelCount: number
    votesTotal: number
    source: string
    updatedAt: string
    topModel: string | null
    topElo: number | null
  }
}

export function useLiveStats(options?: { category?: string; intervalMs?: number }) {
  const category = options?.category ?? 'global'
  const intervalMs = options?.intervalMs ?? 20_000

  const [data, setData] = useState<LiveStatsApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams({ category })
      const res = await fetch(`/api/v1/stats?${params}`, { cache: 'no-store' })
      const json = (await res.json()) as LiveStatsApiResponse
      if (json.ok) {
        setData(json)
        setError(null)
      }
    } catch {
      setError('Stats indisponibles')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, intervalMs)
    const onBump = () => void refresh()
    window.addEventListener(LIVE_STATS_BUMP, onBump)
    return () => {
      clearInterval(timer)
      window.removeEventListener(LIVE_STATS_BUMP, onBump)
    }
  }, [refresh, intervalMs])

  return { data, loading, error, refresh }
}
