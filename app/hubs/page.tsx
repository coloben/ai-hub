import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HUBS } from '@/lib/social/hubs'
import { getUnifiedFeed } from '@/lib/social'
import { countPostsByHub } from '@/lib/social/feed-stats'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Hubs — Espaces thématiques IA',
  description: 'Rejoignez un hub : LLM, Code, Papers, Open Source, Safety… Style subreddit pour l\'IA.',
}

export default async function HubsPage() {
  const { posts } = await getUnifiedFeed({ sort: 'new', hub: 'all' })
  const counts = countPostsByHub(posts)

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Hubs" />

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
          Hubs <span className="text-accent">thématiques</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mb-8 leading-relaxed">
          Chaque hub regroupe posts communauté et actualités importées. Les compteurs ci-dessous
          sont mesurés en temps réel (pas de faux membres).
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {HUBS.map((hub) => {
            const Icon = hub.icon
            const c = counts[hub.id]
            return (
              <Card key={hub.id} className="hover:border-accent/30 transition-colors group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon size={18} className={hub.color} />
                    h/{hub.id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] text-muted-foreground mb-2 leading-relaxed">
                    {hub.description}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mb-4">
                    {c.community} post{c.community !== 1 ? 's' : ''} communauté · {c.curated} import
                    {c.curated !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/?hub=${hub.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                    >
                      Voir le feed <ArrowRight size={14} />
                    </Link>
                    {['coding', 'creativity', 'reasoning', 'french', 'multimodal', 'open-source'].includes(
                      hub.id
                    ) && (
                      <Link
                        href={`/hub/${hub.id === 'open-source' ? 'open-source' : hub.id}`}
                        className="text-[12px] text-muted-foreground hover:text-foreground"
                      >
                        · Leaderboard
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
