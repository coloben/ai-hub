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
  const providerColor: Record<string, string> = {
    'OpenAI':    'text-[#10a37f]',
    'Anthropic': 'text-[#c57f4e]',
    'Google':    'text-[#4285f4]',
    'Meta':      'text-[#0866ff]',
    'DeepSeek':  'text-[#5b73ff]',
    'Alibaba':   'text-[#ff6a00]',
    'Mistral':   'text-[#f7461c]',
    'xAI':       'text-[#a8a8a8]',
    'Zhipu AI':  'text-[#7c3aed]',
  }

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
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
              <span className="text-2xs font-semibold uppercase tracking-widest text-primary">Live</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-text leading-tight">
              Veille Intelligence Artificielle
            </h1>
            <p className="text-sm text-text-2 max-w-xl leading-relaxed">
              Suivez en temps réel la course aux modèles IA — classements, benchmarks, actualités et alertes.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                value: totalModels,
                unit: 'modèles',
                label: 'Modèles suivis',
                sub: `${openCount} open · ${totalModels - openCount} proprio`,
                delta: `+${newCount} nouveaux`,
                accent: 'border-primary/20 bg-primary/5',
                dot: 'bg-primary',
                up: true,
              },
              {
                value: (maxCtx / 1_000_000).toFixed(1),
                unit: 'M tokens',
                label: 'Contexte max',
                sub: maxCtxModel?.name ?? '—',
                delta: 'record absolu',
                accent: 'border-success/20 bg-success/5',
                dot: 'bg-success',
                up: true,
              },
              {
                value: topModel?.scores.arena_elo,
                unit: 'ELO',
                label: 'Meilleur Arena',
                sub: topModel?.name ?? '—',
                delta: `moy. ${avgElo}`,
                accent: 'border-warn/20 bg-warn/5',
                dot: 'bg-warn',
                up: null,
              },
              {
                value: newCount,
                unit: 'nouveaux',
                label: 'Sorties récentes',
                sub: 'ce mois-ci',
                delta: 'modèles mis à jour',
                accent: 'border-border bg-surface',
                dot: 'bg-text-3',
                up: null,
              },
            ].map((s, i) => (
              <div key={i} className={`relative overflow-hidden rounded-xl border p-4 ${s.accent}`}>
                <div className={`absolute right-3 top-3 h-1.5 w-1.5 rounded-full ${s.dot}`} />
                <p className="mb-2 text-2xs font-semibold uppercase tracking-widest text-text-3">{s.label}</p>
                <p className="tabular-nums text-2xl font-bold leading-none tracking-tight text-text">
                  {s.value}<span className="ml-1 text-sm font-normal text-text-2">{s.unit}</span>
                </p>
                <p className="mt-1.5 text-xs text-text-2 truncate">{s.sub}</p>
                <p className={`mt-0.5 text-xs font-medium ${s.up === true ? 'text-success' : 'text-text-3'}`}>
                  {s.up === true ? '↑ ' : ''}{s.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Breaking alerts */}
          {breaking.length > 0 && (
            <div className="mb-8">
              <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">Alertes actives</p>
              <div className="flex flex-col rounded-xl border border-border overflow-hidden">
                {breaking.slice(0, 3).map((a, idx) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2 ${idx > 0 ? 'border-t border-border' : ''}`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.hype_score >= 88 ? 'bg-error' : 'bg-warn'}`} />
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
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 min-h-[140px] transition-all hover:border-primary/30 hover:bg-surface-2 hover:shadow-lg hover:shadow-black/20"
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
                    <p className="text-sm font-semibold leading-snug text-text line-clamp-4 group-hover:text-white transition-colors">{item.title}</p>
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

        {/* ── SIDEBAR — CLASSEMENT ──────────────────────────────────── */}
        <aside className="hidden md:flex flex-col py-8 pl-6">

          <div className="mb-4 flex items-center justify-between">
            <p className="text-2xs font-semibold uppercase tracking-widest text-text-3">Classement Arena</p>
            <Link href="/leaderboard" className="text-xs text-primary hover:underline">Voir tout →</Link>
          </div>

          <div className="flex flex-col gap-0">
            {ranked.map((model, i) => {
              const score = model.scores.arena_elo ?? 0
              const max   = ranked[0].scores.arena_elo ?? 1
              const pct   = Math.round((score / max) * 100)
              const delta = model.rank_delta_7d
              const pColor = providerColor[model.provider] ?? 'text-text-3'
              return (
                <div key={model.id} className="group flex items-center gap-2 border-b border-border py-2.5 last:border-0 hover:bg-surface-2 -mx-2 px-2 rounded transition-colors">
                  <span className={`w-5 shrink-0 text-center text-xs tabular-nums font-bold
                    ${i === 0 ? 'text-[#fbbf24]' : i === 1 ? 'text-text-2' : i === 2 ? 'text-[#cd7f32]' : 'text-text-3'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-semibold text-text">{model.name}</p>
                      {model.is_new && <span className="shrink-0 text-2xs font-bold text-success">●</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <p className={`text-2xs font-medium ${pColor}`}>{model.provider}</p>
                      <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold tabular-nums text-text">{score}</span>
                    <p className={`text-2xs font-semibold ${delta > 0 ? 'text-success' : delta < 0 ? 'text-error' : 'text-text-3'}`}>
                      {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
              <span className="text-2xs font-semibold text-text-2">Mis à jour toutes les heures</span>
            </div>
            <p className="text-2xs text-text-3">Source : LMSYS Chatbot Arena</p>
          </div>

        </aside>

      </div>
    </div>
  )
}

