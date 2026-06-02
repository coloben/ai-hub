import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Sparkles, MessageSquare, Globe, Image, ArrowLeft, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { BreadcrumbSchema } from '@/app/components/json-ld'
import { getRanking } from '@/lib/data/pipeline'

export const metadata = {
  title: 'Hub Thématique IA — Benchmarks par Catégorie | AI Hub',
  description: 'Hubs thématiques dédiés : code, créativité, raisonnement, français, multimodal.',
}

const HUBS: Record<string, { label: string; icon: React.ElementType; description: string; color: string }> = {
  coding: { label: 'Code', icon: Code, description: 'Programmation, debugging, architecture logicielle.', color: 'text-accent' },
  creativity: { label: 'Créativité', icon: Sparkles, description: 'Écriture, storytelling, idéation.', color: 'text-accent-2' },
  reasoning: { label: 'Raisonnement', icon: MessageSquare, description: 'Logique, mathématiques, résolution de problèmes complexes.', color: 'text-accent' },
  french: { label: 'Français', icon: Globe, description: 'Compréhension et expression en langue française.', color: 'text-accent-2' },
  multimodal: { label: 'Multimodal', icon: Image, description: 'Images, audio, vidéo combinés au texte.', color: 'text-accent' },
  'open-source': { label: 'Open Source', icon: Users, description: 'Modèles open weight et open source.', color: 'text-accent-2' },
}

export const dynamic = 'force-dynamic'

export default async function HubPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const hub = HUBS[category]
  if (!hub) return notFound()

  const ranking = await getRanking()

  let models = ranking.models
  if (category === 'open-source') {
    models = models.filter(m => m.category === 'open-weight')
  }

  const Icon = hub.icon

  return (
    <div className="min-h-screen bg-background grid-dots">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://ai-hub-cnb3.vercel.app/' },
          { name: 'Hubs', url: 'https://ai-hub-cnb3.vercel.app/hub/coding' },
          { name: hub.label, url: `https://ai-hub-cnb3.vercel.app/hub/${category}` },
        ]}
      />

      <TopNav />

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft size={11} />
            Retour au feed
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className={hub.color} />
            <span className={`text-[11px] font-medium uppercase tracking-wide ${hub.color}`}>
              Hub {hub.label}
            </span>
          </div>
          <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
            {hub.label}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground max-w-lg">{hub.description}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] flex items-center gap-1.5 font-semibold">
              <TrendingUp size={13} className="text-accent" />
              Leaderboard {hub.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border/40">
            {models.slice(0, 15).map((m, index) => (
              <Link
                key={m.id}
                href={`/model/${m.id}`}
                className="flex items-center gap-3 py-2.5 px-1 hover:bg-muted/30 rounded transition-colors"
              >
                <div className="w-5 text-center">
                  {index < 3 ? (
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-0.5 py-0 h-4 w-4 flex items-center justify-center rounded-full ${
                        index === 0 ? 'bg-accent/20 text-accent' : index === 1 ? 'bg-accent-2/20 text-accent-2' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{m.name}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{m.organization} · {(m.samples ?? 0).toLocaleString()} votes</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold data-num text-foreground">{m.elo}</p>
                </div>
              </Link>
            ))}
            <p className="text-[9px] text-muted-foreground text-center pt-2">
              Source : {ranking.source}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-semibold">Autres hubs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              {Object.entries(HUBS)
                .filter(([key]) => key !== category)
                .map(([key, h]) => {
                  const HubIcon = h.icon
                  return (
                    <Link
                      key={key}
                      href={`/hub/${key}`}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <HubIcon size={13} className={h.color} />
                      <span className="text-[13px] text-foreground">{h.label}</span>
                    </Link>
                  )
                })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <p className="text-[11px] text-muted-foreground mb-2">Votez pour améliorer ce classement.</p>
              <Link
                href={`/compare?cat=${category === 'open-source' ? 'global' : category}`}
                className="inline-flex items-center justify-center h-7 px-3 text-xs rounded-md bg-accent text-accent-foreground font-medium"
              >
                Voter maintenant
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
