import Link from 'next/link'
import { mockModels } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'

function timeAgo(date: string): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 5)  return 'à l\'instant'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

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
    <div
      className="mx-auto grid max-w-[1440px] px-6"
      style={{ height: 'calc(100vh - 48px - 28px)', gridTemplateColumns: '1fr 320px' }}
    >

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0 overflow-y-auto border-r border-border py-8 pr-8">

        {/* Hero title */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-text leading-tight">
            Veille Intelligence Artificielle
          </h1>
          <p className="text-sm text-text-2 max-w-xl">
            Suivez en temps réel la course aux modèles IA — classements, benchmarks, actualités et alertes.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            {
              value: totalModels,
              unit: 'modèles',
              label: 'Modèles suivis',
              sub: `${openCount} open · ${totalModels - openCount} propriétaires`,
              delta: `+${newCount} nouveaux`,
              up: true,
            },
            {
              value: (maxCtx / 1_000_000).toFixed(1),
              unit: 'M tokens',
              label: 'Contexte max',
              sub: `${maxCtxModel?.name}`,
              delta: 'nouveau record',
              up: true,
            },
            {
              value: topModel?.scores.arena_elo,
              unit: 'ELO',
              label: 'Meilleur score',
              sub: topModel?.name ?? '—',
              delta: `moy. ${avgElo}`,
              up: null,
            },
            {
              value: '94.2',
              unit: '%',
              label: 'MMLU record',
              sub: 'Claude 3.5 Sonnet',
              delta: 'benchmark raisonnement',
              up: null,
            },
          ].map((s, i) => (
            <div key={i} className="rounded-sm border border-border bg-surface p-4">
              <p className="mb-1 text-2xs font-semibold uppercase tracking-widest text-text-3">{s.label}</p>
              <p className="tabular-nums text-2xl font-bold leading-none tracking-tight text-text">
                {s.value}<span className="ml-1 text-sm font-normal text-text-2">{s.unit}</span>
              </p>
              <p className="mt-1.5 text-xs text-text-2 truncate">{s.sub}</p>
              <p className={`mt-0.5 text-xs font-medium ${s.up === true ? 'text-success' : s.up === false ? 'text-error' : 'text-text-3'}`}>
                {s.up === true ? '↑ ' : ''}{s.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Breaking alerts */}
        {breaking.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">
              Alertes actives
            </p>
            <div className="flex flex-col gap-0">
              {breaking.slice(0, 3).map(a => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 border-b border-border py-3 transition-colors hover:bg-surface first:border-t"
                >
                  <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${a.hype_score >= 88 ? 'bg-error' : 'bg-warn'}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`mr-2 text-2xs font-bold uppercase tracking-wider ${a.hype_score >= 88 ? 'text-error' : 'text-warn'}`}>
                      {a.hype_score >= 88 ? 'Urgent' : 'Alerte'}
                    </span>
                    <span className="text-sm text-text-2">{a.title}</span>
                  </div>
                  <span className="shrink-0 text-xs text-text-3">{timeAgo(a.published_at)}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Latest news grid */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-2xs font-semibold uppercase tracking-widest text-text-3">Dernières infos</p>
            <Link href="/news" className="text-xs text-text-3 transition-colors hover:text-text-2">
              Feed complet →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {latest.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex aspect-square flex-col justify-between rounded-sm border border-border bg-surface p-4 transition-colors hover:border-border-2 hover:bg-surface-2"
              >
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-text-2">{item.source}</span>
                    <span className="text-text-3">·</span>
                    <span className="text-xs text-text-3">{timeAgo(item.published_at)}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-text line-clamp-4">{item.title}</p>
                </div>
                <div>
                  {item.is_breaking && (
                    <span className="mb-2 block text-2xs font-bold text-error">● Breaking</span>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-2xs text-text-3">#{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* ── RIGHT — CLASSEMENT ────────────────────────────────────── */}
      <aside className="flex flex-col overflow-y-auto py-8 pl-6">

        <div className="mb-4 flex items-center justify-between">
          <p className="text-2xs font-semibold uppercase tracking-widest text-text-3">Classement IA</p>
          <Link href="/leaderboard" className="text-xs text-text-3 transition-colors hover:text-text-2">
            Voir tout →
          </Link>
        </div>

        <div className="mb-2 grid grid-cols-3 gap-2 text-2xs text-text-3 pb-2 border-b border-border">
          <span>#</span>
          <span className="col-span-1">Modèle</span>
          <span className="text-right">ELO</span>
        </div>

        <div className="flex flex-col">
          {ranked.map((model, i) => {
            const score = model.scores.arena_elo ?? 0
            const max   = ranked[0].scores.arena_elo ?? 1
            const pct   = Math.round((score / max) * 100)
            const delta = model.rank_delta_7d
            return (
              <div key={model.id} className="flex items-center gap-2.5 border-b border-border py-2.5 last:border-0">
                <span className={`w-4 shrink-0 text-right text-xs tabular-nums font-bold
                  ${i === 0 ? 'text-gold' : i === 1 ? 'text-text-2' : i === 2 ? 'text-[#7a5c30]' : 'text-text-3'}`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{model.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-text-3">{model.provider}</p>
                    {model.is_new && (
                      <span className="text-2xs font-semibold text-success">new</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-bold tabular-nums text-text">{score}</span>
                  <div className="h-0.5 w-8 overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full ${i === 0 ? 'bg-gold' : i === 1 ? 'bg-text-2' : i === 2 ? 'bg-[#7a5c30]' : 'bg-text-3'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className={`w-5 shrink-0 text-center text-xs font-semibold
                  ${delta > 0 ? 'text-success' : delta < 0 ? 'text-error' : 'text-text-3'}`}>
                  {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                </span>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-2xs text-text-3">
          Source : LMSYS Chatbot Arena · Mis à jour toutes les heures
        </p>

      </aside>

    </div>
  )
}

