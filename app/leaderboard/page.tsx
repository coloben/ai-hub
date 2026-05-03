import type { Metadata } from 'next'
import LeaderboardClient from './LeaderboardClient'

export const metadata: Metadata = {
  title: 'Classement des modèles IA',
  description: 'Ranking Arena ELO, MMLU, HumanEval, MATH, GPQA — GPT-4o, Claude, Gemini, Llama, DeepSeek comparés en temps réel.',
}

export default function LeaderboardPage() {
  return <LeaderboardClient />
}
