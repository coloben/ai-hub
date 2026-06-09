import type { ArenaModel, ArenaScoreKind } from './schema'

export function formatArenaScore(model: Pick<ArenaModel, 'elo' | 'confidenceInterval' | 'scoreKind'>): {
  primary: string
  interval: string | null
} {
  if (model.scoreKind === 'relative') {
    const pct = model.elo / 100
    const ci = (model.confidenceInterval ?? 0) / 100
    return {
      primary: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      interval: ci > 0 ? `±${ci.toFixed(2)}%` : null,
    }
  }

  return {
    primary: String(model.elo),
    interval: model.confidenceInterval ? `±${model.confidenceInterval}` : null,
  }
}

export function scoreKindLabel(kind: ArenaScoreKind): string {
  return kind === 'relative' ? 'Win rate vs baseline' : 'ELO Arena'
}
