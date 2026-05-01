'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockNews, mockModels, subcategoryConfig } from '@/lib/mock-data'
import { InfoTooltip } from '@/components/InfoTooltip'
import { generateBriefing } from '@/lib/intelligence'

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const minutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
  if (minutes < 5) return 'maintenant'
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

export default function Home() {
  const [activeSubcat, setActiveSubcat] = useState<string | null>(null)
  const leadNews = mockNews[0]
  const breakingNews = mockNews.filter(n => n.is_breaking).slice(0, 3)
  const recentNews = mockNews.slice(1, 7)
  const topModel = [...mockModels].filter(m => m.scores.arena_elo).sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))[0]
  const bestCode = mockModels.filter(m => m.subcategory === 'code').sort((a, b) => (b.scores.humaneval ?? 0) - (a.scores.humaneval ?? 0))[0]
  const bestAgent = mockModels.filter(m => m.subcategory === 'agent').sort((a, b) => b.context_window - a.context_window)[0]
  const modelsBySubcat = activeSubcat ? mockModels.filter(m => m.subcategory === activeSubcat) : mockModels
  const topBySubcat = Object.entries(subcategoryConfig).map(([key, config]) => {
    const models = mockModels.filter(m => m.subcategory === key)
    const best = models.sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))[0]
    return { key, config, best, count: models.length }
  }).filter(s => s.count > 0)
  const totalModels = mockModels.length
  const openCount = mockModels.filter(m => m.type === 'open').length
  const newCount = mockModels.filter(m => m.is_new).length
  const avgElo = Math.round(mockModels.filter(m => m.scores.arena_elo).reduce((a, m) => a + (m.scores.arena_elo ?? 0), 0) / mockModels.filter(m => m.scores.arena_elo).length)
  const briefing = generateBriefing()

  return (
    <div className="relative flex overflow-hidden">
      <span className="mesh-orb right-[8%] top-[8%] h-64 w-64 bg-primary/25"></span>
      <span className="mesh-orb left-[42%] top-[28%] h-52 w-52 bg-cyan-500/10"></span>
      <div className="flex-1 px-6 py-6 2xl:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="intel-card relative overflow-hidden rounded-[28px] p-6 md:p-8">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
              <div className="relative">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="signal-ring rounded-full bg-white/[0.04] px-3 py-1 text-2xs font-mono uppercase tracking-[0.24em] text-primary">World AI Signal</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-2xs font-mono text-text-muted">Live depuis Paris</span>
                  <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-2xs font-mono text-amber">Heat {briefing.marketHeat}/100</span>
                  <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-2xs font-mono text-success">Sources {briefing.sourceCoverage}%</span>
                </div>
                <h1 className="max-w-4xl text-[42px] font-semibold leading-[0.98] tracking-[-0.06em] text-text md:text-[64px]">
                  Le centre de contrôle pour comprendre qui gagne vraiment la course à l&apos;IA.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted">
                  Actualités, benchmarks, modèles, coûts API, signaux faibles et explications claires. Une plateforme pensée pour les débutants, les builders et les décideurs.
                </p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 text-2xs uppercase tracking-[0.2em] text-text-faint">Briefing IA automatique</div>
                  <p className="text-sm leading-6 text-text-muted">
                    Signal prioritaire : <span className="font-medium text-text">{briefing.topSignals[0]?.news.title}</span>
                  </p>
                  <p className="mt-1 text-2xs leading-5 text-text-faint">
                    Impact {briefing.topSignals[0]?.impact}/100 · Confiance {briefing.topSignals[0]?.confidence}/100 · Action : {briefing.topSignals[0]?.action}
                  </p>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ['Modèles suivis', totalModels, 'text-primary'],
                    ['Open-source', openCount, 'text-success'],
                    ['Nouveautés', newCount, 'text-amber'],
                    ['ELO moyen', avgElo, 'text-text'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-2xs uppercase tracking-[0.2em] text-text-faint">{label}</div>
                      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/leaderboard" className="rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]">Voir le classement mondial</Link>
                  <Link href="/compare" className="rounded-full border border-white/10 bg-white/[0.045] px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-white/[0.08]">Comparer des modèles</Link>
                  <Link href="/glossary" className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text">Comprendre les termes</Link>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <a href={leadNews.url} target="_blank" rel="noopener noreferrer" className="intel-card intel-card-hover rounded-[28px] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-amber/10 px-3 py-1 text-2xs font-mono uppercase tracking-[0.2em] text-amber">À la une</span>
                  <span className="font-mono text-2xs text-primary">{formatTimeAgo(leadNews.published_at)}</span>
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em]">{leadNews.title}</h2>
                <p className="mt-3 text-sm leading-6 text-text-muted">{leadNews.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {leadNews.tags.map(tag => <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-2xs text-text-muted">#{tag}</span>)}
                </div>
              </a>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Leader global', topModel?.name, `${topModel?.scores.arena_elo ?? '—'} ELO`],
                  ['Meilleur code', bestCode?.name, `${bestCode?.scores.humaneval ?? '—'} HumanEval`],
                  ['Agent watch', bestAgent?.name, `${bestAgent ? Math.round(bestAgent.context_window / 1000) : '—'}k ctx`],
                ].map(([label, name, meta]) => (
                  <div key={label} className="intel-card rounded-2xl p-4">
                    <div className="text-2xs uppercase tracking-[0.2em] text-text-faint">{label}</div>
                    <div className="mt-2 truncate text-sm font-semibold">{name}</div>
                    <div className="mt-1 font-mono text-2xs text-primary">{meta}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-amber">Pulse IA</h2>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber"></span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {breakingNews.map((news) => (
                    <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="intel-card intel-card-hover group rounded-2xl p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full bg-amber/10 px-2 py-0.5 text-2xs font-medium text-amber">FLASH</span>
                        <span className="font-mono text-2xs text-text-faint">{news.source}</span>
                        <span className="ml-auto font-mono text-2xs text-primary">{formatTimeAgo(news.published_at)}</span>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 transition-colors group-hover:text-primary">{news.title}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">{news.summary}</p>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-text-muted">Meilleur modèle par spécialité</h2>
                  <InfoTooltip term="LLM" />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {topBySubcat.map(({ key, config, best, count }) => (
                    <button key={key} onClick={() => setActiveSubcat(activeSubcat === key ? null : key)} className={`intel-card intel-card-hover relative overflow-hidden rounded-2xl p-4 text-left ${activeSubcat === key ? 'ring-1 ring-primary/70' : ''}`}>
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: config.color }}></div>
                      <div className="relative">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-lg">{config.icon}</span>
                          <div><div className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</div><div className="text-2xs text-text-faint">{count} modèle{count > 1 ? 's' : ''}</div></div>
                        </div>
                        <p className="mb-3 min-h-[28px] text-2xs leading-4 text-text-faint">{config.description}</p>
                        {best && <div className="border-t border-white/10 pt-3"><div className="truncate text-xs font-semibold">{best.name}</div><div className="mt-1 flex items-center gap-2 text-2xs"><span className="font-mono text-primary">ELO {best.scores.arena_elo ?? '—'}</span><span className="text-text-faint">{best.provider}</span></div></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {activeSubcat && (
                <div className="intel-card rounded-[24px] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-medium uppercase tracking-[0.22em]" style={{ color: subcategoryConfig[activeSubcat]?.color }}>{subcategoryConfig[activeSubcat]?.icon} {subcategoryConfig[activeSubcat]?.label}</h2>
                    <button onClick={() => setActiveSubcat(null)} className="text-2xs text-text-muted hover:text-text">Fermer</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {modelsBySubcat.map((model) => (
                      <div key={model.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mb-2 flex items-center gap-2"><span className="text-sm font-semibold">{model.name}</span>{model.is_new && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-2xs text-primary">NOUV.</span>}<span className={`ml-auto rounded-full px-2 py-0.5 text-2xs ${model.type === 'open' ? 'bg-success/10 text-success' : 'bg-white/[0.05] text-text-muted'}`}>{model.type === 'open' ? 'Libre' : 'API'}</span></div>
                        <p className="mb-3 line-clamp-2 text-xs leading-5 text-text-muted">{model.description}</p>
                        <div className="grid grid-cols-3 gap-2 font-mono text-2xs"><div><span className="text-text-faint">ELO</span><div className="text-primary">{model.scores.arena_elo ?? '—'}</div></div><div><span className="text-text-faint">MMLU</span><div>{model.scores.mmlu ? `${model.scores.mmlu}%` : '—'}</div></div><div><span className="flex items-center gap-0.5 text-text-faint">Ctx <InfoTooltip term="Fenêtre de contexte" size="sm" /></span><div>{model.context_window > 0 ? `${(model.context_window / 1000).toFixed(0)}k` : '—'}</div></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-medium uppercase tracking-[0.22em] text-text-muted">Derniers signaux analysés</h2><Link href="/news" className="text-2xs text-primary hover:underline">Voir tout ?</Link></div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {recentNews.map((news) => (
                    <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="intel-card intel-card-hover group rounded-2xl p-4">
                      <div className="mb-2 flex items-center gap-2"><span className="font-mono text-2xs uppercase text-text-faint">{news.source}</span><span className="font-mono text-2xs text-primary">{formatTimeAgo(news.published_at)}</span>{news.hype_score > 70 && <span className="ml-auto text-2xs text-amber">?? {news.hype_score}</span>}</div>
                      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary">{news.title}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">{news.summary}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="intel-card rounded-[24px] p-5">
                <h3 className="mb-4 flex items-center gap-1 text-sm font-medium uppercase tracking-[0.2em] text-text-muted">Power Ranking <InfoTooltip term="Arena ELO" size="sm" /></h3>
                <div className="space-y-3">
                  {mockModels.filter(m => m.scores.arena_elo).sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0)).slice(0, 8).map((model, i) => (
                    <div key={model.id} className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs ${i < 3 ? 'bg-primary/15 text-primary' : 'bg-white/[0.04] text-text-faint'}`}>{i + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{model.name}</div><div className="font-mono text-2xs text-text-faint">{model.provider} · {model.scores.arena_elo} ELO</div></div><span className={`rounded-full px-2 py-0.5 text-2xs ${model.type === 'open' ? 'bg-success/10 text-success' : 'bg-white/[0.05] text-text-muted'}`}>{model.type === 'open' ? 'Libre' : 'API'}</span></div>
                  ))}
                </div>
              </div>
              <div className="intel-card rounded-[24px] p-5">
                <h3 className="mb-3 text-sm font-medium text-gradient-intel">Watchlist intelligence</h3>
                <div className="space-y-3">
                  {briefing.topSignals.slice(0, 3).map((signal) => (
                    <div key={signal.news.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-primary">{signal.signalType}</span>
                        <span className={`rounded-full px-2 py-0.5 text-2xs ${signal.severity === 'critical' ? 'bg-amber/10 text-amber' : 'bg-white/[0.05] text-text-muted'}`}>
                          {signal.impact}/100
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-2xs leading-5 text-text-muted">{signal.news.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  )
}

