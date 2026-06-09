import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HUBS } from '@/lib/social/hubs'
import { getUnifiedFeed } from '@/lib/social'
import { getCommunityStats } from '@/lib/votes/stats'
import { LiveCommunityMetrics } from '@/components/live/live-community-metrics'
import { CommunityScoreboard } from '@/components/live/community-scoreboard'
import { getTrustStatus } from '@/lib/trust'
import { DataTrustBanner } from '@/components/trust/data-trust-banner'
import { PersistenceBanner } from '@/components/trust/persistence-banner'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Communauté IA',
  description: 'Statistiques réelles de la communauté AI Hub : posts, duels, votes Arena.',
}

export default async function CommunityPage() {
  const [{ posts }, community, trust] = await Promise.all([
    getUnifiedFeed({ sort: 'top' }),
    getCommunityStats(),
    getTrustStatus(),
  ])

  const communityPosts = posts.filter((p) => p.kind === 'community')
  const topPost = communityPosts[0] ?? posts.find((p) => p.kind === 'curated')

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Communauté" />

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
          Communauté <span className="text-accent">AI Hub</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-xl">
          Métriques mesurées — aucun membre ou karma fictif. Les duels et posts sont comptés
          depuis la base ou le stockage actif.
        </p>

        <div className="space-y-2">
          <DataTrustBanner status={trust} />
          <PersistenceBanner persisted={community.persisted} />
        </div>

        <LiveCommunityMetrics />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">Classement communauté (duels A vs B)</CardTitle>
          </CardHeader>
          <CardContent>
            <CommunityScoreboard category="global" limit={12} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Posts communauté</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {communityPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun post pour l&apos;instant — le feed affiche les actualités Arena sourcées.
                </p>
              ) : (
                communityPosts.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/post/${p.id}`}
                    className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      h/{p.hub} · {p.score} pts · @{p.handle}
                    </p>
                  </Link>
                ))
              )}
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/">Publier sur le feed</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hubs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {HUBS.slice(0, 6).map((h) => (
                <Link
                  key={h.id}
                  href={`/?hub=${h.id}`}
                  className="flex items-center justify-between py-1.5 text-sm hover:text-accent"
                >
                  <span>h/{h.id}</span>
                </Link>
              ))}
              <Button asChild size="sm" className="w-full mt-2">
                <Link href="/hubs">Tous les hubs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {topPost && (
          <p className="text-[11px] text-muted-foreground text-center mt-6">
            Top post affiché : {topPost.title.slice(0, 60)}
            {topPost.title.length > 60 ? '…' : ''} ({topPost.kind === 'community' ? 'communauté' : 'actualité'})
          </p>
        )}
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
