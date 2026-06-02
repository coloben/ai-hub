import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Flame, Trophy, BarChart3, Swords, Hash, ChevronRight,
  Bookmark, UserCircle, Users, Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { DataRankingWidget } from './components/data-ranking'
import { DataFeedStream } from './components/data-feed'
import { PostComposerDisabled, FeedTabsDisabled } from './components/home-feed-ui'
import { HomeStatsBar } from './components/home-stats-bar'
import { RankingPulseWidget } from './components/ranking-pulse-widget'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

function LeftSidebar() {
  const links = [
    { href: '/', icon: Flame, label: 'Feed', active: true },
    { href: '/ranking', icon: Trophy, label: 'Classement ELO' },
    { href: '/compare', icon: Swords, label: 'Comparer' },
    { href: '/ranking', icon: BarChart3, label: 'Modèles' },
    { href: '/community', icon: Users, label: 'Communauté' },
    { href: '/bookmarks', icon: Bookmark, label: 'Signets' },
  ]

  return (
    <nav className="sticky top-20 space-y-1 hidden lg:block" aria-label="Navigation latérale">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              link.active
                ? 'text-accent bg-accent-dim'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon size={20} />
            <span>{link.label}</span>
          </Link>
        )
      })}

      <div className="pt-4 mt-4 border-t border-border">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Compte
        </p>
        <Link
          href="/signup"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <UserCircle size={20} />
          <span>Connexion</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Sparkles size={20} />
          <span>Paramètres</span>
        </Link>
      </div>
    </nav>
  )
}

function HeroCompact({ topModel, modelCount }: { topModel?: string; modelCount: number }) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-accent/[0.03] to-transparent aurora">
      <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
          {modelCount} modèles indexés · données Arena AI
          {topModel ? ` · leader : ${topModel}` : ''}
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl md:text-3xl font-display font-bold tracking-tight leading-tight text-glow">
              <span className="text-foreground">Veille & classement </span>
              <span className="bg-gradient-to-r from-accent via-accent to-accent-2 bg-clip-text text-transparent">
                intelligence artificielle
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-lg leading-relaxed">
              Classements Arena, comparateur et feed d&apos;actualités. Open-data, sans publicité.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" className="rounded-full px-4 h-8">
              <Link href="/signup">Créer un compte</Link>
            </Button>
            <Button variant="outline" asChild size="sm" className="rounded-full px-4 h-8">
              <Link href="/ranking">Classement</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeedSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[90%]" />
            <Skeleton className="h-3 w-[70%]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendingTagsWidget() {
  const tags = ['claude', 'gemini', 'gpt', 'deepseek', 'llama']

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Hash size={16} className="text-accent" />
          Tags populaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tag/${tag}`}
            className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
          >
            <p className="text-sm font-medium text-foreground">#{tag}</p>
            <ChevronRight size={14} className="text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function SuggestedComparisonsWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Swords size={16} className="text-accent" />
          Comparateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[13px] text-muted-foreground mb-3">
          Votez en duel A vs B et alimentez le classement communautaire.
        </p>
        <Button asChild size="sm" className="w-full">
          <Link href="/compare">Ouvrir le comparateur</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function CommunityCTA() {
  return (
    <section className="border-t border-border py-16 bg-gradient-to-b from-transparent to-accent/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-glow">
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            Contribuez au classement communautaire
          </span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Les comptes utilisateur arrivent bientôt. Dès maintenant, comparez des modèles et consultez
          l&apos;export open-data (CSV / JSON).
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/compare">Comparer des modèles</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="rounded-full px-6">
            <Link href="/docs/api">Documentation API</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  const ranking = await getRanking()
  const top = ranking.models[0]

  return (
    <div className="min-h-screen bg-background grid-dots noise">
      <TopNav active="Feed" />
      <HeroCompact topModel={top?.name} modelCount={ranking.models.length} />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 h-20"><Skeleton className="h-full w-full" /></div>}>
        <HomeStatsBar />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-6 py-6">
        <LeftSidebar />

        <main className="min-w-0">
          <Card className="overflow-hidden spotlight">
            <PostComposerDisabled />
            <FeedTabsDisabled />
            <Suspense fallback={<FeedSkeleton />}>
              <DataFeedStream />
            </Suspense>
          </Card>
        </main>

        <aside className="space-y-4 hidden lg:block">
          <Suspense fallback={<Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>}>
            <RankingPulseWidget />
          </Suspense>
          <Suspense fallback={<Card><CardContent className="p-4"><Skeleton className="h-4 w-1/2 mb-2" /><Skeleton className="h-3 w-full" /></CardContent></Card>}>
            <DataRankingWidget />
          </Suspense>
          <TrendingTagsWidget />
          <SuggestedComparisonsWidget />
        </aside>
      </div>

      <CommunityCTA />
      <Footer />
    </div>
  )
}
