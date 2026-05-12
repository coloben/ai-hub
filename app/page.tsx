export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { FeedCard } from '@/components/FeedCard'
import { ArrowUpRight, Zap, GitCompare, FileText, Bell, TrendingUp } from 'lucide-react'

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

  const posts = allNews.slice(0, 12)
  const breaking = allNews.filter(n => n.is_breaking).slice(0, 3)

  return (
    <div className="min-h-screen">

      {/* ── STATS BAR — terminal-style horizontal strip ── */}
      <div className="border-b border-white/[0.06] px-4 md:px-6 py-0 flex items-stretch overflow-x-auto scrollbar-hide">
        <StatCell label="Modèles" value={String(totalModels)} sub={`${openModels} open · ${totalModels - openModels} proprio`} />
        <div className="w-px bg-white/[0.06] shrink-0 my-0" />
        <StatCell label="ELO #1" value={String(topModel?.scores.arena_elo ?? '—')} sub={topModel?.name ?? '—'} accent />
        <div className="w-px bg-white/[0.06] shrink-0 my-0" />
        <StatCell label="Moy. ELO" value={String(avgElo)} sub="arena" />
        <div className="w-px bg-white/[0.06] shrink-0 my-0" />
        <StatCell label="Contexte max" value={`${(maxCtx / 1_000_000).toFixed(1)}M`} sub={maxCtxModel?.name ?? '—'} />
        <div className="w-px bg-white/[0.06] shrink-0 my-0" />
        <StatCell label="Nouveautés" value={String(newModels)} sub="ce mois-ci" />
        <div className="w-px bg-white/[0.06] shrink-0 my-0" />
        <StatCell label="Signaux live" value={String(posts.length)} sub="aujourd'hui" accent />
      </div>

      {/* ── MAIN LAYOUT — feed | right panel ── */}
      <div className="flex min-h-[calc(100vh-93px)]">

        {/* ── LEFT — Feed principal ── */}
        <div className="flex-1 min-w-0 border-r border-white/[0.06]">

          {/* Feed header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] sticky top-[57px] z-10 backdrop-blur-md" style={{ backgroundColor: 'rgba(11,11,15,0.90)' }}>
            <div className="flex items-center gap-2.5">
              <span className="live-dot" />
              <h2 className="text-[13px] font-semibold text-white">Feed IA</h2>
              <span className="text-[11px] text-white/25 font-mono">{posts.length}</span>
            </div>
            <Link href="/news" className="text-[11px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              Tout voir <ArrowUpRight size={11} />
            </Link>
          </div>

          {/* Feed items */}
          <div className="divide-y divide-white/[0.05]">
            {posts.map((item, index) => (
              <FeedCard key={item.id} item={item} index={index} />
            ))}
          </div>

          {/* Load more */}
          <div className="p-5 border-t border-white/[0.06]">
            <Link
              href="/news"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/[0.08] text-[13px] text-white/40 hover:text-white/70 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all"
            >
              Voir tous les signaux →
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL — data sidebar ── */}
        <div className="hidden lg:flex flex-col w-[300px] xl:w-[340px] shrink-0">

          {/* Arena ELO ranking */}
          <div className="border-b border-white/[0.06]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-data" />
                <span className="text-[12px] font-semibold text-white">Arena ELO</span>
              </div>
              <Link href="/leaderboard" className="text-[11px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                Complet <ArrowUpRight size={10} />
              </Link>
            </div>
            <div className="px-3 py-1">
              {ranked.slice(0, 7).map((m, i) => {
                const maxElo = ranked[0].scores.arena_elo ?? 1
                const pct = Math.round(((m.scores.arena_elo ?? 0) / maxElo) * 100)
                const delta = m.rank_delta_7d
                return (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0 group">
                    <span className="text-[11px] font-mono text-white/20 w-4 shrink-0 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-white/75 truncate group-hover:text-white transition-colors">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/30">{m.provider}</span>
                        <div className="h-[2px] flex-1 max-w-[60px] rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-data/40" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-mono font-bold text-data tabular-nums">{m.scores.arena_elo}</p>
                      <p className={`text-[10px] tabular-nums ${delta > 0 ? 'text-up' : delta < 0 ? 'text-down' : 'text-white/20'}`}>
                        {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Breaking alerts */}
          {breaking.length > 0 && (
            <div className="border-b border-white/[0.06]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-down animate-pulse shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Alertes prioritaires</span>
              </div>
              <div className="px-4 py-2 space-y-0">
                {breaking.map(alert => (
                  <a
                    key={alert.id}
                    href={alert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.04] last:border-0 group"
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 px-1.5 py-0.5 rounded ${alert.hype_score >= 90 ? 'text-down bg-down/10' : 'text-data bg-data/10'}`}>
                      {alert.hype_score >= 90 ? 'URGENT' : 'ALERTE'}
                    </span>
                    <p className="text-[12px] text-white/55 group-hover:text-white/80 transition-colors leading-snug">{alert.title}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Trending models */}
          <div className="border-b border-white/[0.06]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]">
              <TrendingUp size={13} className="text-white/40" />
              <span className="text-[12px] font-semibold text-white">Modèles tendance</span>
            </div>
            <div className="px-3 py-1">
              {ranked.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="flex items-center justify-between py-2.5 px-1 border-b border-white/[0.04] last:border-0 group"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-white/65 group-hover:text-white transition-colors truncate">{m.name}</p>
                    <p className="text-[10px] text-white/30">{m.provider}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.is_new && (
                      <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-data/10 text-data">new</span>
                    )}
                    <span className="text-[11px] font-mono text-white/40 tabular-nums">{m.scores.arena_elo ?? '—'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick tools */}
          <div className="p-3 mt-auto">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/20 px-1 mb-2">Outils rapides</p>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/compare" className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all group">
                <GitCompare size={15} className="text-white/35 group-hover:text-white/60 transition-colors" />
                <span className="text-[10px] text-white/35 group-hover:text-white/60 transition-colors">Comparer</span>
              </Link>
              <Link href="/briefing" className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all group">
                <FileText size={15} className="text-white/35 group-hover:text-white/60 transition-colors" />
                <span className="text-[10px] text-white/35 group-hover:text-white/60 transition-colors">Briefing</span>
              </Link>
              <Link href="/alerts" className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all group">
                <Bell size={15} className="text-white/35 group-hover:text-white/60 transition-colors" />
                <span className="text-[10px] text-white/35 group-hover:text-white/60 transition-colors">Alertes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Stat cell — terminal-style ── */
function StatCell({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col justify-center px-5 py-3 shrink-0 min-w-[110px]">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/30 mb-1">{label}</p>
      <p className={`text-[20px] font-black leading-none tabular-nums tracking-tight font-mono ${accent ? 'text-data' : 'text-white'}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-white/30 mt-0.5 truncate max-w-[120px]">{sub}</p>
      )}
    </div>
  )
}
