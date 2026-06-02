import { NextResponse } from 'next/server'
import { getRanking, revalidateRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getRanking()
    return NextResponse.json({
      ok: true,
      data,
      cached: true,
      stale: false,
    })
  } catch (err) {
    console.error('[API /ranking]', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to load ranking' },
      { status: 500 }
    )
  }
}

export async function POST() {
  // On-demand revalidation (secret key check optional for Hobby)
  const result = await revalidateRanking()
  return NextResponse.json(result)
}
