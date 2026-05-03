'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import type { Model } from '@/lib/types'
import type { ModelHistoryPoint } from '@/lib/ingestion'
import { ReviewForm } from './ReviewForm'

interface Review {
  id: string
  rating_quality: number | null
  rating_speed: number | null
  rating_value: number | null
  review_text: string | null
  use_case: string | null
  created_at: string
  author: { username: string; karma: number; level: string } | null
}

interface Props {
  model: Model
  history: ModelHistoryPoint[]
  reviews: Review[]
  avgRatings: { quality: number; speed: number; value: number } | null
  similar: Model[]
}

const PROVIDER_COLOR: Record<string, string> = {
  'OpenAI': '#10a37f', 'Anthropic': '#c57f4e', 'Google': '#4285f4',
  'Meta': '#0866ff', 'DeepSeek': '#5b73ff', 'Alibaba': '#ff6a00',
  'Mistral': '#f7461c', 'xAI': '#a8a8a8', 'Zhipu AI': '#7c3aed',
}

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`h-3.5 w-3.5 ${i < Math.round(value) ? 'text-[#fbbf24]' : 'text-border'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-text-2">{value.toFixed(1)}</span>
    </span>
  )
}

function ScoreBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <div className="text-xs text-text-3">N/A</div>
  const cls = value >= 90 ? 'text-success bg-success/10 border-success/20'
    : value >= 80 ? 'text-primary bg-primary/10 border-primary/20'
    : value >= 70 ? 'text-warn bg-warn/10 border-warn/20'
    : 'text-text-3 bg-surface-3 border-border'
  return (
    <div className={`flex flex-col items-center rounded-xl border p-3 ${cls}`}>
      <span className="text-2xl font-bold tabular-nums leading-none">{value}</span>
      <span className="mt-1 text-2xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
    </div>
  )
}

export default function ModelPageClient({ model, history, reviews, avgRatings, similar }: Props) {
  const [historyRange, setHistoryRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [localReviews, setLocalReviews] = useState(reviews)

  const pColor = PROVIDER_COLOR[model.provider] ?? '#6366f1'

  // Filtrer historique selon range
  const now = Date.now()
  const rangeDays = historyRange === '7d' ? 7 : historyRange === '30d' ? 30 : 90
  const filteredHistory = history.filter(h =>
    now - new Date(h.captured_at).getTime() < rangeDays * 86400000
  )

  // Données graphe ELO
  const chartData = filteredHistory.length > 0
    ? filteredHistory.map(h => ({
        date: new Date(h.captured_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        elo: h.arena_elo,
      }))
    : [
        { date: 'J-30', elo: (model.scores.arena_elo ?? 1200) - 15 },
        { date: 'J-20', elo: (model.scores.arena_elo ?? 1200) - 8 },
        { date: 'J-10', elo: (model.scores.arena_elo ?? 1200) - 3 },
        { date: "Auj.", elo: model.scores.arena_elo ?? 1200 },
      ]

  // Données radar benchmarks
  const radarData = [
    { subject: 'MMLU',      value: model.scores.mmlu ?? 0,      fullMark: 100 },
    { subject: 'HumanEval', value: model.scores.humaneval ?? 0, fullMark: 100 },
    { subject: 'MATH',      value: model.scores.math ?? 0,      fullMark: 100 },
    { subject: 'GPQA',      value: model.scores.gpqa ?? 0,      fullMark: 100 },
    { subject: 'Speed',     value: Math.min((model.scores.speed_tps ?? 0) / 2, 100), fullMark: 100 },
  ]

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 pb-16 md:px-6">

      {/* ── Breadcrumb ── */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-text-3">
        <Link href="/" className="hover:text-text-2">Dashboard</Link>
        <span>/</span>
        <Link href="/leaderboard" className="hover:text-text-2">Classement</Link>
        <span>/</span>
        <span className="text-text-2">{model.name}</span>
      </nav>

      {/* ── Header ── */}
      <div className="mb-8 flex items-start gap-5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ background: pColor }}
        >
          {model.provider.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{model.name}</h1>
            {model.is_new && (
              <span className="rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-2xs font-bold text-success">NEW</span>
            )}
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-2xs text-text-3">
              {model.type === 'open' ? 'Open Source' : 'Propriétaire'}
            </span>
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-2xs text-text-3">
              {model.subcategory_label}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium" style={{ color: pColor }}>{model.provider}</p>
          {model.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-2">{model.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-3">
            <span>Sorti le {new Date(model.release_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            <span>Contexte {(model.context_window / 1000).toFixed(0)}k tokens</span>
            {model.parameters && <span>{model.parameters}</span>}
            {model.api_available && <span className="text-success">✓ API disponible</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold tabular-nums text-text">{model.scores.arena_elo ?? '—'}</p>
          <p className="text-2xs text-text-3">Arena ELO</p>
          {model.rank_delta_7d !== 0 && (
            <p className={`text-xs font-semibold ${model.rank_delta_7d > 0 ? 'text-success' : 'text-error'}`}>
              {model.rank_delta_7d > 0 ? `↑ +${model.rank_delta_7d}` : `↓ ${model.rank_delta_7d}`} 7j
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── COL GAUCHE (2/3) ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">

          {/* Scores benchmarks */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-text">Benchmarks</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ScoreBadge value={model.scores.mmlu} label="MMLU" />
              <ScoreBadge value={model.scores.humaneval} label="HumanEval" />
              <ScoreBadge value={model.scores.math} label="MATH" />
              <ScoreBadge value={model.scores.gpqa} label="GPQA" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-text">
                  {model.scores.speed_tps ? `${model.scores.speed_tps}` : '—'}
                </p>
                <p className="text-2xs text-text-3">tokens/sec</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-text">
                  {model.scores.price_input != null ? `$${model.scores.price_input}` : '—'}
                </p>
                <p className="text-2xs text-text-3">$/1M input</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-text">
                  {model.scores.price_output != null ? `$${model.scores.price_output}` : '—'}
                </p>
                <p className="text-2xs text-text-3">$/1M output</p>
              </div>
            </div>
          </section>

          {/* Historique ELO */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Évolution Arena ELO</h2>
              <div className="flex gap-1">
                {(['7d', '30d', '90d'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setHistoryRange(r)}
                    className={`rounded-md px-2.5 py-1 text-2xs font-semibold transition-colors ${
                      historyRange === r
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-3 hover:text-text-2'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: pColor }}
                />
                <Line
                  type="monotone" dataKey="elo" stroke={pColor} strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: pColor }}
                />
              </LineChart>
            </ResponsiveContainer>
            {filteredHistory.length === 0 && (
              <p className="mt-2 text-center text-2xs text-text-3">
                Données accumulées dès la prochaine heure — cron actif
              </p>
            )}
          </section>

          {/* Reviews communauté */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">Avis de la communauté</h2>
                {avgRatings && (
                  <div className="mt-1 flex gap-4 text-2xs text-text-3">
                    <span>Qualité <Stars value={avgRatings.quality} /></span>
                    <span>Vitesse <Stars value={avgRatings.speed} /></span>
                    <span>Valeur <Stars value={avgRatings.value} /></span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setReviewFormOpen(o => !o)}
                className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                + Mon avis
              </button>
            </div>

            {reviewFormOpen && (
              <ReviewForm
                modelId={model.id}
                onSuccess={(review: Review) => {
                  setLocalReviews(prev => [review, ...prev])
                  setReviewFormOpen(false)
                }}
              />
            )}

            {localReviews.length === 0 && !reviewFormOpen ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">⭐</p>
                <p className="text-sm font-semibold text-text">Premier avis</p>
                <p className="text-xs text-text-3 mt-1">Partagez votre expérience avec {model.name}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                {localReviews.map(review => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-2xs font-bold text-primary">
                          {review.author?.username?.slice(0, 2).toUpperCase() ?? '??'}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-text">@{review.author?.username ?? 'anonyme'}</span>
                          {review.use_case && (
                            <span className="ml-2 text-2xs text-text-3">· {review.use_case}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-2xs text-text-3 shrink-0">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-4 text-2xs text-text-3">
                      {review.rating_quality && <span>Qualité <Stars value={review.rating_quality} /></span>}
                      {review.rating_speed && <span>Vitesse <Stars value={review.rating_speed} /></span>}
                      {review.rating_value && <span>Valeur <Stars value={review.rating_value} /></span>}
                    </div>
                    {review.review_text && (
                      <p className="mt-2 text-sm text-text-2 leading-relaxed">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* ── COL DROITE (1/3) ── */}
        <div className="flex flex-col gap-6">

          {/* Radar benchmarks */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-2 text-sm font-semibold text-text">Profil de performance</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={model.name} dataKey="value" stroke={pColor} fill={pColor} fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </section>

          {/* Use cases */}
          {model.best_for && model.best_for.length > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-text">Idéal pour</h2>
              <div className="flex flex-wrap gap-2">
                {model.best_for.map(uc => (
                  <span key={uc} className="rounded-lg bg-surface-2 border border-border px-2.5 py-1 text-xs text-text-2">
                    {uc}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Liens */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">Liens</h2>
            <div className="flex flex-col gap-2">
              {model.changelog_url && (
                <a href={model.changelog_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Changelog officiel
                </a>
              )}
              <Link href={`/compare?m=${model.id}`}
                className="flex items-center gap-2 text-xs text-text-2 hover:text-text transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Comparer avec d'autres
              </Link>
            </div>
          </section>

          {/* Modèles similaires */}
          {similar.length > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-text">Modèles similaires</h2>
              <div className="flex flex-col gap-2">
                {similar.map(m => (
                  <Link
                    key={m.id}
                    href={`/models/${m.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-surface-2 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-text">{m.name}</p>
                      <p className="text-2xs text-text-3">{m.provider}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-text-2">{m.scores.arena_elo ?? '—'}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
