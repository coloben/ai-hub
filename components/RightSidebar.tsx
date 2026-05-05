import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { PROVIDER_COLORS } from '@/lib/constants'

export function RightSidebar() {
  const ranked = [...mockModels]
    .filter(m => m.scores.arena_elo)
    .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
    .slice(0, 5)

  const topModel = ranked[0]
  const maxElo = topModel?.scores.arena_elo ?? 1

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-[340px] bg-void-950 border-l border-border z-40 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <h2 className="font-semibold text-text-primary">Top Arena</h2>
        <Link href="/leaderboard" className="text-xs text-accent hover:underline">
          Voir tout
        </Link>
      </div>

      {/* Ranking */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {ranked.map((model, i) => {
          const score = model.scores.arena_elo ?? 0
          const pct = Math.round((score / maxElo) * 100)
          const delta = model.rank_delta_7d
          const pColor = PROVIDER_COLORS[model.provider] ?? 'text-text-tertiary'

          return (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="card-rank group"
            >
              {/* Rank number */}
              <span className={`w-5 text-center text-sm font-bold tabular-nums ${
                i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-n'
              }`}>
                {i + 1}
              </span>

              {/* Model info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                    {model.name}
                  </p>
                  {model.is_new && (
                    <span className="badge-success shrink-0">NEW</span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`text-xs ${pColor}`}>{model.provider}</span>
                  <div className="progress-thin flex-1">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              {/* Score & delta */}
              <div className="shrink-0 text-right">
                <p className="data-value text-sm text-text-primary">
                  {score}
                </p>
                <p className={`text-2xs font-medium ${
                  delta > 0 ? 'data-delta-up' : delta < 0 ? 'data-delta-down' : 'text-text-quaternary'
                }`}>
                  {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                </p>
              </div>
            </Link>
          )
        })}

        {/* Stats summary */}
        <div className="glass p-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="data-value text-xl text-text-primary">{mockModels.length}</p>
              <p className="data-label mt-1">Modèles</p>
            </div>
            <div>
              <p className="data-value text-xl text-accent">
                {Math.max(...mockModels.map(m => m.scores.arena_elo || 0))}
              </p>
              <p className="data-label mt-1">Max ELO</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-divider flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-xs text-text-secondary">Mis à jour toutes les heures</span>
          </div>
          <p className="text-2xs text-text-quaternary mt-1">Source: LMSYS Arena</p>
        </div>

        {/* Quick links */}
        <div className="mt-4 space-y-1">
          <p className="px-1 text-2xs font-semibold uppercase tracking-wider text-text-quaternary">
            Accès rapide
          </p>
          <Link href="/compare" className="nav-item text-xs">
            <span>⚖</span>
            <span>Comparer 2 modèles</span>
          </Link>
          <Link href="/cost-calculator" className="nav-item text-xs">
            <span>◊</span>
            <span>Calculer un budget</span>
          </Link>
          <Link href="/alerts" className="nav-item text-xs">
            <span>◉</span>
            <span>Mes alertes</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="glass p-3 text-center">
          <p className="text-xs text-text-secondary mb-2">Rejoins la communauté IA</p>
          <Link href="/login" className="btn-primary w-full text-xs">
            Se connecter
          </Link>
        </div>
      </div>
    </aside>
  )
}
