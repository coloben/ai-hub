import Link from 'next/link'
import { Model } from '@/lib/types'
import { PROVIDER_COLORS } from '@/lib/constants'

interface ArenaRankingProps {
  models: Model[]
}

export function ArenaRanking({ models }: ArenaRankingProps) {
  return (
    <aside className="hidden md:flex flex-col py-8 pl-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-3">Classement Arena</p>
        <Link href="/leaderboard" className="text-xs text-primary hover:underline">Voir tout →</Link>
      </div>

      <div className="flex flex-col gap-0">
        {models.map((model, i) => {
          const score = model.scores.arena_elo ?? 0
          const max = models[0].scores.arena_elo ?? 1
          const pct = Math.round((score / max) * 100)
          const delta = model.rank_delta_7d
          const pColor = PROVIDER_COLORS[model.provider] ?? 'text-text-3'
          return (
            <a key={model.id} href={`/models/${model.id}`}
              className="group flex items-center gap-2 border-b border-border py-2.5 last:border-0 hover:bg-surface-2 -mx-2 px-2 rounded transition-colors">
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
                    <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-bold tabular-nums text-text">{score}</span>
                <p className={`text-2xs font-semibold ${delta > 0 ? 'text-success' : delta < 0 ? 'text-error' : 'text-text-3'}`}>
                  {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                </p>
              </div>
            </a>
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
  )
}
