import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import Link from 'next/link'
import { OrganizationSchema, BreadcrumbSchema } from '@/app/components/json-ld'
import { Suspense } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { CommunityScoreboard } from '@/components/live/community-scoreboard'
import { getRanking } from '@/lib/data/pipeline'
import { rankingFromData } from '@/lib/trust'
import { DataTrustBanner } from '@/components/trust/data-trust-banner'
import { CertifiedBadge } from '@/components/trust/certified-badge'

export const metadata = {
  title: 'Classement IA — Leaderboard Arena AI & Benchmarks | AI Hub',
  description:
    'Classement temps réel des modèles IA basé sur Arena AI et les votes communautaires. Comparez les derniers modèles IA.',
}

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'proprietary', label: 'Propriétaires' },
  { key: 'open-weight', label: 'Open Weight' },
]

/* ── Hero ──────────────────────────────────────────────────────────────── */

function HeroRanking() {
  return (
    <section className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={14} className="text-accent" />
          <span className="text-[11px] font-medium text-accent tracking-wide">
            Classement Arena certifié
          </span>
        </div>
        <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-foreground">
          Le classement des meilleurs modèles IA
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground max-w-xl leading-relaxed">
          ELO et volumes issus de Chatbot Arena (LMSYS). Cache 5 min · vérifiable sur lmarena.ai.
        </p>
      </div>
    </section>
  )
}

/* ── Filter Tabs ──────────────────────────────────────────────────────── */

function FilterTabs({ active }: { active: string }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
      <Filter size={13} className="text-muted-foreground shrink-0" />
      {FILTERS.map((f) => (
        <Link
          key={f.key}
          href={`/ranking?filter=${f.key}`}
          className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
            f.key === active ? 'text-accent bg-accent-dim' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────── */

export const dynamic = 'force-dynamic'

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const params = await searchParams
  const filter = params.filter ?? 'all'

  const ranking = await getRanking()
  const trust = rankingFromData(ranking)
  const models = filter === 'all'
    ? ranking.models
    : ranking.models.filter(m => m.category === filter)

  return (
    <div className="min-h-screen bg-background grid-dots">
      <OrganizationSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: 'https://ai-hub-cnb3.vercel.app/' },
          { name: 'Classement', url: 'https://ai-hub-cnb3.vercel.app/ranking' },
        ]}
      />

      <TopNav active="Classement" />
      <HeroRanking />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterTabs active={filter} />

        <div className="mt-3">
          <DataTrustBanner status={trust} />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* Main ranking table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] flex items-center gap-1.5 font-semibold">
                <Trophy size={13} className="text-accent" />
                Classement ELO
                <CertifiedBadge variant="arena" className="ml-2" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border/40">
              {models.slice(0, 20).map((m, idx) => (
                <Link
                  key={m.id}
                  href={`/model/${m.id}`}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-muted/30 rounded transition-colors"
                >
                  <span className={`text-xs font-mono font-bold w-5 text-center ${idx < 3 ? 'text-accent' : 'text-muted-foreground'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {m.organization} · {(m.samples ?? 0).toLocaleString('fr-FR')} votes Arena
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold data-num text-foreground">{m.elo}</p>
                    <p className={`text-[10px] font-mono ${m.eloDelta > 0 ? 'text-green-400' : m.eloDelta < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {m.eloDelta > 0 ? `+${m.eloDelta}` : m.eloDelta < 0 ? `${m.eloDelta}` : '—'}
                    </p>
                  </div>
                </Link>
              ))}
              <p className="text-[10px] text-muted-foreground text-center pt-3">
                Source : {ranking.source} · Mis à jour {new Date(ranking.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-semibold">Tendances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {ranking.models.filter(m => m.eloDelta !== 0).slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-1">
                    <span className="text-[13px] text-foreground truncate">{m.name}</span>
                    <div className={`flex items-center gap-0.5 text-[10px] font-mono ${m.eloDelta > 0 ? 'text-green-400' : 'text-destructive'}`}>
                      {m.eloDelta > 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      {m.eloDelta > 0 ? '+' : ''}{m.eloDelta}
                    </div>
                  </div>
                ))}
                {ranking.models.filter(m => m.eloDelta !== 0).length === 0 && (
                  <p className="text-[11px] text-muted-foreground py-2">
                    Variations jour/jour indisponibles pour ce snapshot Arena.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-semibold">Votes communauté</CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityScoreboard category="global" limit={8} compact />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[13px] font-semibold">Méthodologie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Le classement est basé sur les scores ELO d&apos;Arena AI (Chatbot Arena), la plateforme de benchmark crowdsourced la plus suivie. Données rafraîchies quotidiennement.
                </p>
                <Link href="/about" className="text-[11px] text-accent hover:underline mt-2 inline-block">En savoir plus →</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
