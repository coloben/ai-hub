import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { FeedCard } from '@/components/FeedCard'

export default async function Home() {
  const allNews = await getLiveNews()

  // Stats
  const totalModels = mockModels.length
  const openModels = mockModels.filter(m => m.type === 'open').length
  const newModels = mockModels.filter(m => m.is_new).length
  const maxCtxModel = [...mockModels].sort((a, b) => (b.context_window || 0) - (a.context_window || 0))[0]
  const maxCtx = maxCtxModel?.context_window || 0

  const ranked = [...mockModels]
    .filter(m => m.scores.arena_elo)
    .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))

  const topModel = ranked[0]
  const avgElo = Math.round(ranked.reduce((acc, m) => acc + (m.scores.arena_elo || 0), 0) / ranked.length)

  // News
  const posts = allNews.slice(0, 12)
  const breaking = allNews.filter(n => n.is_breaking).slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <span className="live-dot" />
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent">Live</span>
          <span className="text-text-quaternary">·</span>
          <span className="text-xs text-text-tertiary">{posts.length} signaux aujourd'hui</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">
          Veille Intelligence Artificielle
        </h1>
        <p className="text-sm text-text-secondary max-w-lg">
          La course aux modèles IA en temps réel — benchmarks, actualités, analyses.
        </p>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-4 gap-4">
          <div className="card-stat">
            <p className="data-label mb-2">Modèles suivis</p>
            <p className="data-value text-data-lg text-text-primary">{totalModels}</p>
            <p className="text-xs text-text-tertiary mt-1">
              {openModels} open · {totalModels - openModels} proprio
            </p>
            <p className="text-xs text-accent mt-1">+{newModels} ce mois</p>
          </div>

          <div className="card-stat">
            <p className="data-label mb-2">Meilleur ELO</p>
            <p className="data-value text-data-lg text-accent">{topModel?.scores.arena_elo || '—'}</p>
            <p className="text-xs text-text-tertiary mt-1 truncate">
              {topModel?.name || '—'}
            </p>
            <p className="text-xs text-text-quaternary mt-1">moy. {avgElo}</p>
          </div>

          <div className="card-stat">
            <p className="data-label mb-2">Contexte Max</p>
            <p className="data-value text-data-lg text-text-primary">{(maxCtx / 1_000_000).toFixed(1)}M</p>
            <p className="text-xs text-text-tertiary mt-1 truncate">
              {maxCtxModel?.name || '—'}
            </p>
            <p className="text-xs text-accent mt-1">record absolu</p>
          </div>

          <div className="card-stat">
            <p className="data-label mb-2">Nouveautés</p>
            <p className="data-value text-data-lg text-text-primary">{newModels}</p>
            <p className="text-xs text-text-tertiary mt-1">ce mois-ci</p>
            <p className="text-xs text-text-quaternary mt-1">modèles mis à jour</p>
          </div>
        </section>

        {/* Breaking Alerts */}
        {breaking.length > 0 && (
          <section className="glass-highlight p-4 animate-fade-scale">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-error">Alertes actives</span>
            </div>
            <div className="space-y-2">
              {breaking.map((alert) => (
                <a
                  key={alert.id}
                  href={alert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-void-700/50 transition-colors group"
                >
                  <span className="text-signal font-bold text-xs uppercase tracking-wider shrink-0">
                    {alert.hype_score >= 90 ? 'Urgent' : 'Alerte'}
                  </span>
                  <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                    {alert.title}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Main Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-text-primary">Feed IA</h2>
              <span className="text-2xs text-text-quaternary">{posts.length} items</span>
            </div>
            <Link href="/news" className="text-xs text-accent hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="space-y-3">
            {posts.map((item, index) => (
              <FeedCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <Link href="/compare" className="glass p-4 text-center hover:border-accent/30 transition-colors group">
            <p className="text-2xl mb-2">⚖</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">Comparer</p>
            <p className="text-xs text-text-tertiary mt-1">2 modèles côte à côte</p>
          </Link>
          <Link href="/briefing" className="glass p-4 text-center hover:border-accent/30 transition-colors group">
            <p className="text-2xl mb-2">◫</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">Briefing</p>
            <p className="text-xs text-text-tertiary mt-1">Résumé quotidien IA</p>
          </Link>
          <Link href="/alerts" className="glass p-4 text-center hover:border-accent/30 transition-colors group">
            <p className="text-2xl mb-2">◉</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">Alertes</p>
            <p className="text-xs text-text-tertiary mt-1">Surveillance personnalisée</p>
          </Link>
        </section>
      </div>
    </div>
  )
}

