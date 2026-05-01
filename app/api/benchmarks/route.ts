import { NextResponse } from 'next/server'
import { mockModels } from '@/lib/mock-data'
import { BenchmarkMatrix } from '@/lib/types'

export const revalidate = 300

export async function GET() {
  const benchmarks = ['MMLU', 'HumanEval', 'MATH', 'GPQA', 'Arena ELO', 'Speed TPS']
  
  const topModels = mockModels
    .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
    .slice(0, 10)
  
  const modelNames = topModels.map(m => m.name)
  
  const matrix = topModels.map(m => [
    m.scores.mmlu,
    m.scores.humaneval,
    m.scores.math,
    m.scores.gpqa,
    m.scores.arena_elo,
    m.scores.speed_tps,
  ])
  
  const response: BenchmarkMatrix = {
    benchmarks,
    models: modelNames,
    matrix,
    last_updated: new Date().toISOString(),
  }
  
  return NextResponse.json(response)
}
