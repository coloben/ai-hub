import { NextRequest, NextResponse } from 'next/server'
import { mockModels } from '@/lib/mock-data'
import { ModelsResponse } from '@/lib/types'

export const revalidate = 300

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

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
  
  return NextResponse.json(response, { headers: CORS })
}
