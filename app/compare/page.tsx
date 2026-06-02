import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Swords, TrendingUp, Code, Sparkles, MessageSquare, Globe, Image } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { CommunityVoteWidget } from './community-vote'
import { CommunityLeaderboard } from './leaderboard'
import { getRanking } from '@/lib/data/pipeline'

const CATEGORIES = [
  { key: 'global', label: 'Global', icon: Trophy, description: 'Le meilleur modèle tout usage confondu' },
  { key: 'coding', label: 'Code', icon: Code, description: 'Programmation, debugging, architecture' },
  { key: 'creativity', label: 'Créativité', icon: Sparkles, description: 'Écriture, storytelling, idéation' },
  { key: 'reasoning', label: 'Raisonnement', icon: MessageSquare, description: 'Logique, mathématiques, problèmes complexes' },
  { key: 'french', label: 'Français', icon: Globe, description: 'Compréhension et expression en français' },
  { key: 'multimodal', label: 'Multimodal', icon: Image, description: 'Images, audio, vidéo combinés au texte' },
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
  const category = CATEGORIES.find((c) => c.key === activeCategory) ?? CATEGORIES[0]

  const ranking = await getRanking()
  const modelCount = ranking.models.length
  const totalVotes = ranking.models.reduce((sum, m) => sum + (m.samples ?? 0), 0)

  return (
    <div className="min-h-screen bg-background grid-dots">
      <TopNav active="Comparer" />

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Swords size={14} className="text-accent" />
            <span className="text-[11px] font-medium text-accent tracking-wide">Benchmark communautaire</span>
          </div>
          <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
            Votez : quel modèle est le meilleur ?
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground max-w-lg">
            Des milliers de votes communautaires par catégorie. Pas d&apos;algorithme opaque, juste la voix des utilisateurs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <CategoryTabs active={activeCategory} />

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="h-32 bg-card animate-pulse rounded-md" /><div className="h-32 bg-card animate-pulse rounded-md" /></div>}>
              <CommunityVoteWidget category={activeCategory} />
            </Suspense>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] flex items-center gap-1.5 font-semibold">
                  <TrendingUp size={13} className="text-accent" />
                  Leaderboard {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>}>
                  <CommunityLeaderboard category={activeCategory} />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="bg-accent/[0.03] border-accent/10">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm font-bold data-num text-accent">{(totalVotes / 1000).toFixed(1)}K</p>
                    <p className="text-[9px] text-muted-foreground">Votes</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold data-num text-accent">{modelCount}</p>
                    <p className="text-[9px] text-muted-foreground">Modèles</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold data-num text-accent">{CATEGORIES.length}</p>
                    <p className="text-[9px] text-muted-foreground">Catégories</p>
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
