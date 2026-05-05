import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { timeAgo } from '@/lib/constants'
import { StatCard } from '@/components/StatCard'
import { BreakingAlerts } from '@/components/BreakingAlerts'
import { ArenaRanking } from '@/components/ArenaRanking'

export default async function Home() {
  // ── Data ──────────────────────────────────────────────────────────────
  const allNews = await getLiveNews()
  const ranked = [...mockModels]
    .filter(m => m.scores.arena_elo)
    .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
    .slice(0, 10)

  const totalModels = mockModels.length
  const openCount   = mockModels.filter(m => m.type === 'open').length
  const newCount    = mockModels.filter(m => m.is_new).length
  const maxCtx      = Math.max(...mockModels.map(m => m.context_window))
  const maxCtxModel = mockModels.find(m => m.context_window === maxCtx)
  const topModel    = ranked[0]
  const avgElo      = Math.round(ranked.reduce((a, m) => a + (m.scores.arena_elo ?? 0), 0) / ranked.length)

  const breaking    = allNews.filter(n => n.is_breaking)
  const latest      = allNews.slice(0, 4)

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6">
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}
      >

        {/* ── MAIN ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col border-r border-border py-8 pr-6 md:pr-8 min-h-[calc(100vh-76px)]">

          {/* Hero */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
              <span className="text-2xs font-semibold uppercase tracking-widest text-primary">Live</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-text">
              Veille Intelligence Artificielle
            </h1>
            <p className="text-sm text-text-2 max-w-xl">
              Suivez en temps réel la course aux modèles IA — classements, benchmarks, actualités et alertes.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard value={totalModels} unit="modèles" label="Modèles suivis"
              sub={`${openCount} open · ${totalModels - openCount} proprio`} delta={`+${newCount} nouveaux`}
              accent="border-primary/20 bg-primary/5" dot="bg-primary" up={true} />
            <StatCard value={(maxCtx / 1_000_000).toFixed(1)} unit="M tokens" label="Contexte max"
              sub={maxCtxModel?.name ?? '—'} delta="record absolu"
              accent="border-success/20 bg-success/5" dot="bg-success" up={true} />
            <StatCard value={topModel?.scores.arena_elo ?? '—'} unit="ELO" label="Meilleur Arena"
              sub={topModel?.name ?? '—'} delta={`moy. ${avgElo}`}
              accent="border-warn/20 bg-warn/5" dot="bg-warn" up={null} />
            <StatCard value={newCount} unit="nouveaux" label="Sorties récentes"
              sub="ce mois-ci" delta="modèles mis à jour"
              accent="border-border bg-surface" dot="bg-text-3" up={null} />
          </div>

          {/* Breaking alerts */}
          <BreakingAlerts items={breaking} />

          {/* Latest news */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-2xs font-semibold uppercase tracking-widest text-text-3">Dernières infos</p>
              <Link href="/news" className="text-xs text-primary hover:underline transition-colors">
                Feed complet →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {latest.map(item => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 min-h-[140px] transition-all hover:border-border-hover hover:bg-surface-2"
                >
                  <div>
                    <div className="mb-2 flex items-center gap-1.5">
                      {item.is_breaking && (
                        <span className="h-1.5 w-1.5 rounded-full bg-error live-pulse shrink-0" />
                      )}
                      <span className="text-xs font-medium text-text-2 truncate">{item.source}</span>
                      <span className="text-text-3 shrink-0">·</span>
                      <span className="text-xs text-text-3 shrink-0">{timeAgo(item.published_at)}</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-text line-clamp-4 group-hover:text-text transition-colors">{item.title}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-2xs text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ── SIDEBAR ──────────────────────────────────────────────── */}
        <ArenaRanking models={ranked} />

      </div>
    </div>
  )
}

