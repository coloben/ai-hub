import type { Metadata } from 'next'
import BenchmarksClient from './BenchmarksClient'

export const metadata: Metadata = {
  title: 'Benchmarks IA',
  description: 'Comparaison radar, bar chart et timeline des scores MMLU, HumanEval, MATH, GPQA, Arena ELO pour tous les LLM.',
}

export default function BenchmarksPage() {
  return <BenchmarksClient />
}
