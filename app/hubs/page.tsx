import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HUBS } from '@/lib/social/hubs'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Hubs — Espaces thématiques IA',
  description: 'Rejoignez un hub : LLM, Code, Open Source, Safety… Style subreddit pour l\'IA.',
}

export default function HubsPage() {
  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Hubs" />

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
          Hubs <span className="text-accent">thématiques</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mb-8 leading-relaxed">
          Chaque hub est un espace dédié — comme un subreddit. Publiez, votez et discutez
          dans le contexte qui vous correspond.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {HUBS.map((hub) => {
            const Icon = hub.icon
            return (
              <Card key={hub.id} className="hover:border-accent/30 transition-colors group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon size={18} className={hub.color} />
                    h/{hub.id}
                    <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                      {hub.memberCount} membres
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                    {hub.description}
                  </p>
                  <div className="flex gap-2">
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
