import { NextRequest, NextResponse } from 'next/server'
import { getAllRecommendations, getRecommendationForUseCase, UseCase, useCaseMetas } from '@/lib/decision'

export const revalidate = 300

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const useCase = searchParams.get('useCase') as UseCase | null

  if (useCase) {
    const valid = useCaseMetas.map(m => m.id)
    if (!valid.includes(useCase)) {
      return NextResponse.json({ error: `useCase must be one of: ${valid.join(', ')}` }, { status: 400 })
    }
    return NextResponse.json(getRecommendationForUseCase(useCase))
  }

  return NextResponse.json(getAllRecommendations())
}
