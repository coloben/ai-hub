import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { FeedCard } from '@/components/FeedCard'
import { ArrowUpRight, GitCompare, FileText, Bell } from 'lucide-react'

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
  const posts = allNews.slice(0, 10)
  const breaking = allNews.filter(n => n.is_breaking).slice(0, 2)

  return (
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="px-5 md:px-8 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="live-dot" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Live</span>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">{posts.length} signaux</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
          Veille Intelligence Artificielle
        </h1>
        <p className="text-sm text-white/50 max-w-lg">
          La course aux modèles IA — benchmarks, actualités, analyses.
        </p>
      </header>

      <div className="px-5 md:px-8 py-6 space-y-8 max-w-5xl">
        {/* ── DATA NUMBERS — massive, floating ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
          <div>
            <p className="data-label mb-1">Modèles suivis</p>
            <p className="data-num text-3xl text-white">{totalModels}</p>
            <p className="text-xs text-white/40 mt-1">{openModels} open · {totalModels - openModels} proprio</p>
            <p className="text-xs text-data mt-1">+{newModels} ce mois</p>
          </div>
          <div>
            <p className="data-label mb-1">Meilleur ELO</p>
            <p className="data-num text-3xl text-data">{topModel?.scores.arena_elo || '—'}</p>
            <p className="text-xs text-white/40 mt-1 truncate">{topModel?.name || '—'}</p>
            <p className="text-xs text-white/25 mt-1">moy. {avgElo}</p>
          </div>
          <div>
            <p className="data-label mb-1">Contexte Max</p>
            <p className="data-num text-3xl text-white">{(maxCtx / 1_000_000).toFixed(1)}<span className="text-lg text-white/40">M</span></p>
            <p className="text-xs text-white/40 mt-1 truncate">{maxCtxModel?.name || '—'}</p>
            <p className="text-xs text-data mt-1">record</p>
          </div>
          <div>
            <p className="data-label mb-1">Nouveautés</p>
            <p className="data-num text-3xl text-white">{newModels}</p>
            <p className="text-xs text-white/40 mt-1">ce mois-ci</p>
            <p className="text-xs text-white/25 mt-1">modèles</p>
          </div>
        </section>

        {/* ── ARENA RANKING — top 5, line structure ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Arena Ranking</h2>
            <Link href="/leaderboard" className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="border-t border-white/10">
            {ranked.slice(0, 5).map((m, i) => {
              const maxElo = ranked[0].scores.arena_elo ?? 1
              const pct = Math.round(((m.scores.arena_elo ?? 0) / maxElo) * 100)
              const delta = m.rank_delta_7d
              return (
                <div key={m.id} className="line-item">
                  <span className="data-num text-sm w-6 text-white/30">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">{m.name}</span>
                      {m.is_new && <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70">new</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40">{m.provider}</span>
                      <div className="h-1 flex-1 max-w-[140px] rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-white/30" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="data-num text-sm text-white">{m.scores.arena_elo}</p>
                    <p className={`text-[11px] ${delta > 0 ? 'text-up' : delta < 0 ? 'text-down' : 'text-white/25'}`}>
                      {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── BREAKING — if any ── */}
        {breaking.length > 0 && (
          <section className="border border-white/20 rounded-lg p-4 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-down animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Alertes</span>
            </div>
            {breaking.map(alert => (
              <a
                key={alert.id}
                href={alert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 py-2 hover:bg-white/[0.03] transition-colors rounded px-2 -mx-2"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 shrink-0">
                  {alert.hype_score >= 90 ? 'Urgent' : 'Alerte'}
                </span>
                <p className="text-sm text-white/60 hover:text-white transition-colors">{alert.title}</p>
              </a>
            ))}
          </section>
        )}

        {/* ── FEED IA — line structure, not cards ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Feed IA</h2>
              <span className="text-[11px] text-white/30">{posts.length} items</span>
            </div>
            <Link href="/news" className="text-xs text-white/50 hover:text-white transition-colors">
              Voir tout →
            </Link>
          </div>
          <div className="border-t border-white/10">
            {posts.map((item, index) => (
              <FeedCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* ── QUICK ACTIONS — minimal icons ── */}
        <section className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <Link href="/compare" className="flex items-center gap-3 py-3 px-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all group">
            <GitCompare size={18} className="text-white/40 group-hover:text-white transition-colors" />
            <div>
              <p className="text-sm font-medium text-white">Comparer</p>
              <p className="text-[11px] text-white/35">2 modèles côte à côte</p>
            </div>
          </Link>
          <Link href="/briefing" className="flex items-center gap-3 py-3 px-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all group">
            <FileText size={18} className="text-white/40 group-hover:text-white transition-colors" />
            <div>
              <p className="text-sm font-medium text-white">Briefing</p>
              <p className="text-[11px] text-white/35">Résumé quotidien</p>
            </div>
          </Link>
          <Link href="/alerts" className="flex items-center gap-3 py-3 px-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all group">
            <Bell size={18} className="text-white/40 group-hover:text-white transition-colors" />
            <div>
              <p className="text-sm font-medium text-white">Alertes</p>
              <p className="text-[11px] text-white/35">Surveillance IA</p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  )
}

