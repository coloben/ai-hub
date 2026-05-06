import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { FeedCard } from '@/components/FeedCard'
import { ArrowUpRight, GitCompare, FileText, Bell, Zap, Newspaper } from 'lucide-react'

export default async function Home() {
  const allNews = await getLiveNews()

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

  const posts = allNews.slice(0, 10)
  const breaking = allNews.filter(n => n.is_breaking).slice(0, 2)

  return (
    <div className="min-h-screen pb-24">
      {/* ── HEADER ── */}
      <header className="px-6 md:px-10 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="live-dot" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">Live</span>
          <span className="text-white/15">|</span>
          <span className="text-xs text-white/35">{posts.length} signaux aujourd'hui</span>
        </div>
        <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-white leading-[1.1] mb-2">
          Veille Intelligence Artificielle
        </h1>
        <p className="text-[15px] text-white/45 max-w-xl leading-relaxed">
          La course aux modèles IA — benchmarks, actualités, analyses. En temps réel.
        </p>
      </header>

      <div className="px-6 md:px-10 py-8 space-y-10 max-w-4xl mx-auto">
        {/* ── DATA NUMBERS — massive focal points ── */}
        <section className="surface-section p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="data-label mb-3">Modèles suivis</p>
              <p className="data-num text-[48px] leading-none text-white">{totalModels}</p>
              <p className="text-[13px] text-white/40 mt-2">{openModels} open · {totalModels - openModels} proprio</p>
            </div>
            <div>
              <p className="data-label mb-3">Meilleur ELO</p>
              <p className="data-num text-[48px] leading-none text-data">{topModel?.scores.arena_elo || '—'}</p>
              <p className="text-[13px] text-white/40 mt-2 truncate">{topModel?.name || '—'}</p>
            </div>
            <div>
              <p className="data-label mb-3">Contexte Max</p>
              <p className="data-num text-[48px] leading-none text-white">{(maxCtx / 1_000_000).toFixed(1)}<span className="text-[24px] text-white/35">M</span></p>
              <p className="text-[13px] text-white/40 mt-2 truncate">{maxCtxModel?.name || '—'}</p>
            </div>
            <div>
              <p className="data-label mb-3">Nouveautés</p>
              <p className="data-num text-[48px] leading-none text-white">{newModels}</p>
              <p className="text-[13px] text-white/40 mt-2">ce mois-ci</p>
            </div>
          </div>
        </section>

        {/* ── ARENA RANKING ── */}
        <section className="surface-section p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Zap size={16} className="text-white/50" />
              <h2 className="text-sm font-semibold text-white">Arena Ranking</h2>
            </div>
            <Link href="/leaderboard" className="text-[13px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-1">
            {ranked.slice(0, 5).map((m, i) => {
              const maxElo = ranked[0].scores.arena_elo ?? 1
              const pct = Math.round(((m.scores.arena_elo ?? 0) / maxElo) * 100)
              const delta = m.rank_delta_7d
              return (
                <div key={m.id} className="flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg hover:bg-white/[0.04] transition-colors cursor-default">
                  <span className="data-num text-sm w-6 text-white/25">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-white/90 truncate">{m.name}</span>
                      {m.is_new && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/8 text-white/60">new</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[13px] text-white/35">{m.provider}</span>
                      <div className="h-[3px] flex-1 max-w-[120px] rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full bg-white/25" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="data-num text-[15px] text-white/90">{m.scores.arena_elo}</p>
                    <p className={`text-[11px] mt-0.5 ${delta > 0 ? 'text-up' : delta < 0 ? 'text-down' : 'text-white/25'}`}>
                      {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── BREAKING ── */}
        {breaking.length > 0 && (
          <section className="surface-section p-6 border-l-[3px] border-l-data">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-down animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Alertes prioritaires</span>
            </div>
            <div className="space-y-3">
              {breaking.map(alert => (
                <a
                  key={alert.id}
                  href={alert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 px-3 -mx-3 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-data shrink-0 mt-0.5">
                      {alert.hype_score >= 90 ? 'Urgent' : 'Alerte'}
                    </span>
                    <p className="text-[14px] text-white/70 hover:text-white transition-colors leading-snug">{alert.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── FEED IA ── */}
        <section className="surface-section p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Newspaper size={16} className="text-white/50" />
              <h2 className="text-sm font-semibold text-white">Feed IA</h2>
              <span className="text-[11px] text-white/25">{posts.length} items</span>
            </div>
            <Link href="/news" className="text-[13px] text-white/40 hover:text-white transition-colors">
              Voir tout →
            </Link>
          </div>
          <div className="px-2 -mx-2">
            {posts.map((item, index) => (
              <FeedCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* ── QUICK ACTIONS ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/compare" className="surface-section p-5 hover:bg-white/[0.03] transition-colors group flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <GitCompare size={18} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">Comparer</p>
              <p className="text-[13px] text-white/35 mt-0.5">2 modèles côte à côte</p>
            </div>
          </Link>
          <Link href="/briefing" className="surface-section p-5 hover:bg-white/[0.03] transition-colors group flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <FileText size={18} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">Briefing</p>
              <p className="text-[13px] text-white/35 mt-0.5">Résumé quotidien</p>
            </div>
          </Link>
          <Link href="/alerts" className="surface-section p-5 hover:bg-white/[0.03] transition-colors group flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <Bell size={18} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">Alertes</p>
              <p className="text-[13px] text-white/35 mt-0.5">Surveillance IA</p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  )
}

