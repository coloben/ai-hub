import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Swords, TrendingUp, Code, Sparkles, MessageSquare, Globe, Image } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { CommunityVoteWidget } from './community-vote'
import { ArenaLeaderboard } from './arena-leaderboard'
import { DuelStatsPanel } from './duel-stats'
import { RankingMetaBar } from './ranking-meta'
import { getCommunityStats } from '@/lib/votes/stats'
import { getRanking } from '@/lib/data/pipeline'
import { getTrustStatus } from '@/lib/trust'
import { DataTrustBanner } from '@/components/trust/data-trust-banner'

const CATEGORIES = [
  { key: 'global', label: 'Global', icon: Trophy },
  { key: 'coding', label: 'Code', icon: Code },
  { key: 'creativity', label: 'Créativité', icon: Sparkles },
  { key: 'reasoning', label: 'Raisonnement', icon: MessageSquare },
  { key: 'french', label: 'Français', icon: Globe },
  { key: 'multimodal', label: 'Multimodal', icon: Image },
] as const

function CategoryTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const isActive = cat.key === active
        return (
          <Link
            key={cat.key}
            href={`/compare?cat=${cat.key}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              isActive ? 'text-accent bg-accent-dim' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon size={13} />
            {cat.label}
          </Link>
        )
      })}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const params = await searchParams
  const activeCategory = params.cat ?? 'global'

  const [ranking, communityStats, trust] = await Promise.all([
    getRanking(),
    getCommunityStats(),
    getTrustStatus(),
  ])

  const modelCount = ranking.models.length
  const arenaVotesTotal = ranking.models.reduce((sum, m) => sum + (m.samples ?? 0), 0)

  return (
    <div className="min-h-screen bg-background grid-dots">
      <TopNav active="Comparer" />

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Swords size={14} className="text-accent" />
            <span className="text-[11px] font-medium text-accent tracking-wide">Duels A vs B</span>
          </div>
          <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
            Comparateur — votes réels, résultats transparents
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">
            Chaque clic enregistre un vote vérifiable (1 par paire et navigateur). Les pourcentages reflètent
            uniquement les duels AI Hub — l&apos;ELO Arena reste une source distincte et certifiée.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <CategoryTabs active={activeCategory} />

        <div className="mt-3 space-y-3">
          <DataTrustBanner status={trust} compact />
          <RankingMetaBar />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-card animate-pulse rounded-md" />
                  <div className="h-32 bg-card animate-pulse rounded-md" />
                </div>
              }
            >
              <CommunityVoteWidget category={activeCategory} />
            </Suspense>
          </div>

          <div className="space-y-3">
            <Suspense fallback={<div className="h-24 bg-muted animate-pulse rounded-lg" />}>
              <DuelStatsPanel category={activeCategory} />
            </Suspense>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] flex items-center gap-1.5 font-semibold">
                  <TrendingUp size={13} className="text-accent-2" />
                  Référence Arena (ELO)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  }
                >
                  <ArenaLeaderboard />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="bg-accent/[0.03] border-accent/10">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm font-bold data-num text-accent-2">
                      {(arenaVotesTotal / 1000).toFixed(1)}k
                    </p>
                    <p className="text-[9px] text-muted-foreground">Votes Arena</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold data-num text-accent">{communityStats.totalDuelVotes}</p>
                    <p className="text-[9px] text-muted-foreground">Duels AI Hub</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold data-num text-foreground">{modelCount}</p>
                    <p className="text-[9px] text-muted-foreground">Modèles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
