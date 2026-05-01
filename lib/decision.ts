import { mockModels } from './mock-data'
import { enrichModel } from './intelligence'
import { Model } from './types'

export type UseCase =
  | 'code'
  | 'agent'
  | 'value'
  | 'enterprise'
  | 'local'
  | 'multimodal'

export interface UseCaseMeta {
  id: UseCase
  label: string
  icon: string
  description: string
  criteria: string[]
}

export interface DecisionScore {
  model: Model
  finalScore: number
  breakdown: Record<string, number>
  verdict: string
  caveat?: string
}

export interface UseCaseRecommendation {
  useCase: UseCaseMeta
  winner: DecisionScore
  runners: DecisionScore[]
  explanation: string
}

export const useCaseMetas: UseCaseMeta[] = [
  {
    id: 'code',
    label: 'Meilleur pour coder',
    icon: '💻',
    description: 'Génération, complétion, débogage et revue de code.',
    criteria: ['HumanEval', 'MMLU', 'Vitesse', 'Contexte'],
  },
  {
    id: 'agent',
    label: 'Meilleur pour les agents',
    icon: '🤖',
    description: 'Orchestration autonome, outils, planification multi-étapes.',
    criteria: ['Contexte', 'GPQA', 'Arena ELO', 'Disponibilité API'],
  },
  {
    id: 'value',
    label: 'Meilleur rapport qualité/prix',
    icon: '💸',
    description: 'Performance maximale au coût minimal par token.',
    criteria: ['Prix input', 'Prix output', 'Arena ELO', 'MMLU'],
  },
  {
    id: 'enterprise',
    label: 'Meilleur pour l\'entreprise / RGPD',
    icon: '🏢',
    description: 'Déploiement souverain, confidentialité des données, SLA.',
    criteria: ['Type propriétaire/open', 'RGPD', 'Stabilité API', 'Contexte'],
  },
  {
    id: 'local',
    label: 'Meilleur open-source local',
    icon: '🔓',
    description: 'Self-hosting, fine-tuning, souveraineté totale, 0 coût API.',
    criteria: ['Type open', 'MMLU', 'HumanEval', 'Paramètres'],
  },
  {
    id: 'multimodal',
    label: 'Meilleur multimodal',
    icon: '🖼',
    description: 'Vision, image, audio et texte combinés.',
    criteria: ['Sous-catégorie vision', 'Arena ELO', 'MMLU', 'Contexte'],
  },
]

function scoreForCode(model: Model): { breakdown: Record<string, number>; final: number } {
  const humaneval = model.scores.humaneval ?? 0
  const mmlu      = model.scores.mmlu ?? 50
  const speed     = Math.min(100, (model.scores.speed_tps ?? 30) / 1.5)
  const ctx       = Math.min(100, model.context_window / 20000)
  const breakdown = {
    'HumanEval':  Math.round(humaneval),
    'MMLU':       Math.round(mmlu),
    'Vitesse':    Math.round(speed),
    'Contexte':   Math.round(ctx * 100),
  }
  const final = Math.round(humaneval * 0.45 + mmlu * 0.25 + speed * 0.15 + ctx * 100 * 0.15)
  return { breakdown, final: Math.min(100, final) }
}

function scoreForAgent(model: Model): { breakdown: Record<string, number>; final: number } {
  const ctx     = Math.min(100, model.context_window / 20000)
  const gpqa    = model.scores.gpqa ?? 50
  const elo     = model.scores.arena_elo ? Math.min(100, (model.scores.arena_elo - 900) / 5) : 50
  const api     = model.api_available ? 100 : 20
  const breakdown = {
    'Contexte':   Math.round(ctx * 100),
    'GPQA':       Math.round(gpqa),
    'Arena ELO':  Math.round(elo),
    'API dispo':  api,
  }
  const final = Math.round(ctx * 100 * 0.35 + gpqa * 0.25 + elo * 0.25 + api * 0.15)
  return { breakdown, final: Math.min(100, final) }
}

function scoreForValue(model: Model): { breakdown: Record<string, number>; final: number } {
  const priceIn  = model.scores.price_input  ?? 5
  const priceOut = model.scores.price_output ?? 5
  const costScore = Math.max(0, Math.min(100, 100 - (priceIn + priceOut) * 8))
  const elo      = model.scores.arena_elo ? Math.min(100, (model.scores.arena_elo - 900) / 5) : 50
  const mmlu     = model.scores.mmlu ?? 50
  const breakdown = {
    'Coût total': Math.round(costScore),
    'Arena ELO':  Math.round(elo),
    'MMLU':       Math.round(mmlu),
  }
  const final = Math.round(costScore * 0.45 + elo * 0.30 + mmlu * 0.25)
  return { breakdown, final: Math.min(100, final) }
}

function scoreForEnterprise(model: Model): { breakdown: Record<string, number>; final: number } {
  const sovereignty = model.type === 'open' ? 100 : 60
  const stability   = model.api_available ? 80 : 40
  const ctx         = Math.min(100, model.context_window / 20000)
  const elo         = model.scores.arena_elo ? Math.min(100, (model.scores.arena_elo - 900) / 5) : 50
  const breakdown = {
    'Souveraineté': Math.round(sovereignty),
    'Stabilité API': Math.round(stability),
    'Contexte':      Math.round(ctx * 100),
    'Performance':   Math.round(elo),
  }
  const final = Math.round(sovereignty * 0.35 + stability * 0.25 + ctx * 100 * 0.20 + elo * 0.20)
  return { breakdown, final: Math.min(100, final) }
}

function scoreForLocal(model: Model): { breakdown: Record<string, number>; final: number } {
  if (model.type !== 'open') return { breakdown: { 'Open-source': 0 }, final: 0 }
  const mmlu     = model.scores.mmlu ?? 50
  const humaneval = model.scores.humaneval ?? 40
  const newBonus  = model.is_new ? 10 : 0
  const breakdown = {
    'Open-source': 100,
    'MMLU':        Math.round(mmlu),
    'HumanEval':   Math.round(humaneval),
    'Nouveau':     newBonus,
  }
  const final = Math.round(100 * 0.20 + mmlu * 0.35 + humaneval * 0.35 + newBonus * 0.10)
  return { breakdown, final: Math.min(100, final) }
}

function scoreForMultimodal(model: Model): { breakdown: Record<string, number>; final: number } {
  const isVision  = model.subcategory === 'vision' ? 100 : model.subcategory === 'audio' ? 60 : 20
  const elo       = model.scores.arena_elo ? Math.min(100, (model.scores.arena_elo - 900) / 5) : 50
  const mmlu      = model.scores.mmlu ?? 50
  const ctx       = Math.min(100, model.context_window / 20000)
  const breakdown = {
    'Capacité vision': Math.round(isVision),
    'Arena ELO':       Math.round(elo),
    'MMLU':            Math.round(mmlu),
    'Contexte':        Math.round(ctx * 100),
  }
  const final = Math.round(isVision * 0.40 + elo * 0.25 + mmlu * 0.20 + ctx * 100 * 0.15)
  return { breakdown, final: Math.min(100, final) }
}

function scorerFor(useCase: UseCase) {
  switch (useCase) {
    case 'code':       return scoreForCode
    case 'agent':      return scoreForAgent
    case 'value':      return scoreForValue
    case 'enterprise': return scoreForEnterprise
    case 'local':      return scoreForLocal
    case 'multimodal': return scoreForMultimodal
  }
}

function verdictFor(useCase: UseCase, model: Model, score: number): string {
  if (score < 40) return 'Non recommandé pour ce cas d\'usage.'
  const base = score >= 85 ? 'Meilleur choix actuel' : score >= 70 ? 'Très bon candidat' : 'Option viable'
  const suffix: Record<UseCase, string> = {
    code:       ' pour la génération et revue de code.',
    agent:      ' pour orchestrer des agents autonomes.',
    value:      ' avec un excellent rapport performance/coût.',
    enterprise: ' pour un déploiement souverain et conforme RGPD.',
    local:      ' pour du self-hosting sans dépendance cloud.',
    multimodal: ' pour les tâches combinant texte et image/audio.',
  }
  return `${base} ${model.provider}${suffix[useCase]}`
}

function caveatsFor(useCase: UseCase, model: Model): string | undefined {
  if (useCase === 'enterprise' && model.type === 'open') return 'Prévoir infra de déploiement et maintenance interne.'
  if (useCase === 'local' && model.type !== 'open') return undefined
  if (useCase === 'value' && (model.scores.price_input ?? 0) === 0) return 'Coût API non publié — vérifier avant usage en production.'
  if (useCase === 'agent' && !model.api_available) return 'Pas d\'API officielle — intégration complexe.'
  return undefined
}

function explanationFor(useCase: UseCase, winner: Model): string {
  const map: Record<UseCase, string> = {
    code:       `${winner.name} domine grâce à son score HumanEval et sa vitesse de génération. Idéal pour les copilotes de code, la génération de tests et la revue automatisée.`,
    agent:      `${winner.name} offre la meilleure combinaison contexte étendu + raisonnement GPQA. Sa disponibilité API assure une intégration fiable dans les pipelines agents.`,
    value:      `${winner.name} livre un niveau de performance élevé au coût le plus compétitif par million de tokens. Optimal pour les volumes importants.`,
    enterprise: `${winner.name} combine performance et capacité de déploiement souverain. Recommandé pour les environnements soumis au RGPD ou à des politiques de confidentialité strictes.`,
    local:      `${winner.name} est le modèle open-source le plus performant actuellement déployable en self-hosting, avec la meilleure combinaison MMLU/HumanEval sans coût API.`,
    multimodal: `${winner.name} est conçu pour traiter texte, image et dans certains cas audio. Il offre le meilleur équilibre capacité visuelle / performance générale.`,
  }
  return map[useCase]
}

export function getRecommendationForUseCase(useCase: UseCase, models = mockModels): UseCaseRecommendation {
  const meta = useCaseMetas.find(m => m.id === useCase)!
  const scorer = scorerFor(useCase)

  const scored: DecisionScore[] = models
    .map(model => {
      const { breakdown, final } = scorer(model)
      return {
        model,
        finalScore: final,
        breakdown,
        verdict: verdictFor(useCase, model, final),
        caveat: caveatsFor(useCase, model),
      }
    })
    .filter(d => d.finalScore > 0)
    .sort((a, b) => b.finalScore - a.finalScore)

  const [winner, ...runners] = scored

  return {
    useCase: meta,
    winner,
    runners: runners.slice(0, 4),
    explanation: explanationFor(useCase, winner.model),
  }
}

export function getAllRecommendations(models = mockModels): UseCaseRecommendation[] {
  return useCaseMetas.map(meta => getRecommendationForUseCase(meta.id, models))
}
