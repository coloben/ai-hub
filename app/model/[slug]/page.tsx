import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, ExternalLink, ArrowLeft, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { BreadcrumbSchema, DatasetSchema } from '@/app/components/json-ld'
import { getRanking } from '@/lib/data/pipeline'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const ranking = await getRanking()
    return ranking.models.slice(0, 40).map((m) => ({ slug: m.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const ranking = await getRanking()
  const model = ranking.models.find((m) => m.id === slug)

  if (!model) {
    return {
      title: 'Modèle introuvable | AI Hub',
      description: 'Ce modèle n’est pas présent dans le classement Arena actuel.',
    }
  }

  const rank = ranking.models.findIndex((m) => m.id === slug) + 1
  const title = `${model.name} — ELO ${model.elo} (#${rank}) | AI Hub`
  const description = `Fiche ${model.name} (${model.organization}) : ELO ${model.elo}, ${(model.samples ?? 0).toLocaleString('fr-FR')} votes Arena, rang #${rank}. Données ${ranking.source}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/model/${slug}`,
      type: 'article',
    },
    alternates: { canonical: `${BASE_URL}/model/${slug}` },
  }
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ranking = await getRanking()
  const model = ranking.models.find((m) => m.id === slug)

  if (!model) return notFound()

  const TrendIcon = model.eloDelta > 0 ? TrendingUp : model.eloDelta < 0 ? TrendingDown : Minus
  const trendColor =
    model.eloDelta > 0 ? 'text-green-400' : model.eloDelta < 0 ? 'text-destructive' : 'text-muted-foreground'
  const otherModels = ranking.models.filter((m) => m.id !== slug).slice(0, 5)
  const rank = ranking.models.findIndex((m) => m.id === slug) + 1

  return (
    <div className="min-h-screen bg-background grid-dots">
      <DatasetSchema
        name={model.name}
        description={`Fiche du modèle ${model.name} par ${model.organization}. ELO: ${model.elo}.`}
        url={`${BASE_URL}/model/${slug}`}
        dateModified={ranking.updatedAt}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: `${BASE_URL}/` },
          { name: 'Classement', url: `${BASE_URL}/ranking` },
          { name: model.name, url: `${BASE_URL}/model/${slug}` },
        ]}
      />

      <TopNav />

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/ranking"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={11} />
            Retour au classement
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-[10px]">{model.category ?? 'proprietary'}</Badge>
                <span className="text-[11px] text-muted-foreground">{model.organization}</span>
              </div>
              <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
                {model.name}
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                #{rank} · ELO {model.elo} · {(model.samples ?? 0).toLocaleString('fr-FR')} votes Arena
              </p>
            </div>
            <div className={`flex items-center gap-1 text-[13px] font-mono ${trendColor}`}>
              <TrendIcon size={14} />
              {model.eloDelta > 0 ? '+' : ''}
              {model.eloDelta}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] flex items-center gap-1.5 font-semibold">
                <BarChart3 size={13} className="text-accent" />
                Performances Arena
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/30">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">ELO Score</p>
                  <p className="text-lg font-bold data-num text-foreground mt-0.5">{model.elo}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/30">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Votes Arena</p>
                  <p className="text-lg font-bold data-num text-foreground mt-0.5">
                    {(model.samples ?? 0).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-muted/30">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Rang</p>
                  <p className="text-lg font-bold data-num text-foreground mt-0.5">#{rank}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/30">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Variation ELO</p>
                  <p className={`text-lg font-bold data-num mt-0.5 ${trendColor}`}>
                    {model.eloDelta > 0 ? '+' : ''}
                    {model.eloDelta}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Source : {ranking.source} · MAJ {new Date(ranking.updatedAt).toLocaleString('fr-FR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px]">{model.category ?? 'proprietary'}</Badge>
                <span className="text-[11px] text-muted-foreground">
                  {model.category === 'open-weight' ? 'Modèle à poids ouverts' : 'Modèle propriétaire'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-semibold">Modèles proches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {otherModels.map((m) => (
                <Link
                  key={m.id}
                  href={`/model/${m.id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors group"
                >
                  <span className="text-[13px] text-foreground truncate">{m.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{m.elo}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <Link
                href="/compare"
                className="inline-flex items-center justify-center w-full h-7 px-3 text-xs rounded-md bg-accent text-accent-foreground font-medium"
              >
                Voter dans le comparateur
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
