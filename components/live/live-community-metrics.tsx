'use client'

import { useLiveStats } from '@/hooks/use-live-stats'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Swords, Vote } from 'lucide-react'

export function LiveCommunityMetrics() {
  const { data, loading } = useLiveStats({ intervalMs: 20_000 })

  const duels = data?.community.totalDuelVotes ?? 0
  const posts = data?.social.communityPostCount ?? 0
  const voters = data?.community.uniqueVoters ?? 0

  return (
    <div className="grid sm:grid-cols-3 gap-4 my-8">
      <Card>
        <CardContent className="pt-4">
          <Vote className="text-accent mb-2" size={20} />
          <p className="text-2xl font-bold font-mono tabular-nums">
            {loading && !data ? '…' : duels}
          </p>
          <p className="text-[12px] text-muted-foreground">duels AI Hub (live)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <MessageSquare className="text-accent-2 mb-2" size={20} />
          <p className="text-2xl font-bold font-mono tabular-nums">
            {loading && !data ? '…' : posts}
          </p>
          <p className="text-[12px] text-muted-foreground">posts communauté</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <Swords className="text-warning mb-2" size={20} />
          <p className="text-2xl font-bold font-mono tabular-nums">
            {loading && !data ? '…' : voters}
          </p>
          <p className="text-[12px] text-muted-foreground">votants uniques</p>
        </CardContent>
      </Card>
    </div>
  )
}
