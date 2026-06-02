import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HUBS } from '@/lib/social/hubs'
import { getUnifiedFeed } from '@/lib/social'
import { Trophy, MessageSquare, TrendingUp, Swords } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Communauté IA',
  description: 'Stats communauté, hubs actifs et contributeurs.',
}

export default async function CommunityPage() {
  const { posts } = await getUnifiedFeed({ sort: 'top' })
  const communityPosts = posts.filter((p) => p.kind === 'community').slice(0, 5)
  const topPost = posts[0]

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Communauté" />

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
          Communauté <span className="text-accent">AI Hub</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-xl">
          Votez, publiez, commentez. Karma et comptes persistants arrivent — la couche sociale est déjà live.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Card>
            <CardContent className="pt-4">
              <TrendingUp className="text-accent mb-2" size={20} />
              <p className="text-2xl font-bold font-mono">{posts.length}</p>
              <p className="text-[12px] text-muted-foreground">posts dans le feed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MessageSquare className="text-accent-2 mb-2" size={20} />
              <p className="text-2xl font-bold font-mono">
                {posts.reduce((a, p) => a + p.commentCount, 0)}
              </p>
              <p className="text-[12px] text-muted-foreground">commentaires</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <Trophy className="text-warning mb-2" size={20} />
              <p className="text-2xl font-bold font-mono truncate text-sm">
                {topPost?.title.slice(0, 24)}…
              </p>
              <p className="text-[12px] text-muted-foreground">top post (score {topPost?.score})</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Posts communauté</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {communityPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun post — soyez le premier.</p>
              ) : (
                communityPosts.map((p) => (
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
              <CardTitle className="text-sm">Hubs populaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {HUBS.slice(0, 6).map((h) => (
                <Link
                  key={h.id}
                  href={`/?hub=${h.id}`}
                  className="flex items-center justify-between py-1.5 text-sm hover:text-accent"
                >
                  <span>h/{h.id}</span>
                  <span className="text-[11px] text-muted-foreground">{h.memberCount}</span>
                </Link>
              ))}
              <Button asChild size="sm" className="w-full mt-2">
                <Link href="/hubs">Tous les hubs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-accent/20 bg-accent-dim/20">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <Swords size={18} className="text-accent" />
                Comparateur de modèles
              </h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                Duels A vs B — alimente le classement communautaire en parallèle du feed.
              </p>
            </div>
            <Button asChild>
              <Link href="/compare">Voter maintenant</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />
      <MobileNav />
    </div>
  )
}
