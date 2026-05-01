import { NextRequest, NextResponse } from 'next/server'
import { mockModels } from '@/lib/mock-data'
import { ModelsResponse } from '@/lib/types'

export const revalidate = 300

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const sort = searchParams.get('sort') || 'arena'
  const limit = parseInt(searchParams.get('limit') || '20')
  const provider = searchParams.get('provider') || 'all'
  
  let models = [...mockModels]
  
  if (provider !== 'all') {
    models = models.filter(m => m.provider.toLowerCase() === provider.toLowerCase())
  }
  
  const sortFieldMap: Record<string, keyof typeof mockModels[0]['scores']> = {
    arena: 'arena_elo',
    mmlu: 'mmlu',
    coding: 'humaneval',
    math: 'math',
    speed: 'speed_tps',
    price: 'price_input',
  }
  
  const sortField = sortFieldMap[sort] || 'arena_elo'
  
  models.sort((a, b) => {
    const aVal = a.scores[sortField] ?? 0
    const bVal = b.scores[sortField] ?? 0
    return bVal - aVal
  })
  
  models = models.slice(0, limit)
  
  const response: ModelsResponse = {
    models,
    last_updated: new Date().toISOString(),
  }
  
  return NextResponse.json(response)
}
