import { Suspense } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { HubSidebar } from '@/components/social/hub-sidebar'
import { SocialFeed } from '@/components/social/social-feed'
import { TrendingPanel } from '@/components/social/trending-panel'
import { HomeStatsBar } from './components/home-stats-bar'
import { getUnifiedFeed } from '@/lib/social'
import { getTrustStatus } from '@/lib/trust'
import { DataTrustBanner } from '@/components/trust/data-trust-banner'
import { HUB_IDS } from '@/lib/social/hubs'
import type { HubId } from '@/lib/social/hubs'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Feed — Communauté IA',
  description: 'Le Reddit / X de l\'intelligence artificielle. News Arena, hubs thématiques, votes et discussions.',
}

interface PageProps {
  searchParams: Promise<{ hub?: string; sort?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const hubParam = params.hub
  const hub: HubId | 'all' =
    hubParam && HUB_IDS.includes(hubParam as HubId) ? (hubParam as HubId) : 'all'

  const [{ posts }, trust] = await Promise.all([
    getUnifiedFeed({ sort: 'hot', hub }),
    getTrustStatus(),
  ])

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Feed" />

      <div className="border-b border-border bg-gradient-to-r from-accent/[0.04] via-transparent to-accent-2/[0.03]">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight">
              {hub === 'all' ? (
                <>Feed <span className="text-accent">IA</span></>
              ) : (
                <>
                  h/<span className="text-accent">{hub}</span>
                </>
              )}
            </h1>
            <p className="text-[12px] text-muted-foreground">
              Actualités sourcées · posts communauté avec votes réels uniquement
            </p>
          </div>
          <Suspense fallback={<Skeleton className="h-8 w-48" />}>
            <HomeStatsBar />
          </Suspense>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-3">
        <DataTrustBanner status={trust} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,680px)_minmax(260px,1fr)] gap-5 py-3 pb-5">
        <Suspense fallback={<div className="hidden lg:block w-[240px]" />}>
          <HubSidebar />
        </Suspense>

        <main className="min-w-0">
          <Card className="overflow-hidden border-border/80 shadow-sm shadow-black/20">
            <SocialFeed initialPosts={posts} hub={hub} />
          </Card>
        </main>

        <aside className="hidden lg:block space-y-4">
          <Suspense
            fallback={
              <Card className="p-4">
                <Skeleton className="h-24 w-full" />
              </Card>
            }
          >
            <TrendingPanel />
          </Suspense>
        </aside>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
