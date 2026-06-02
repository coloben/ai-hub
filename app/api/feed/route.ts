import { NextResponse } from 'next/server'
import { getFeed, revalidateFeed } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getFeed()
    return NextResponse.json({
      ok: true,
      data,
      cached: true,
      stale: false,
    })
  } catch (err) {
    console.error('[API /feed]', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to load feed' },
      { status: 500 }
    )
  }
}

export async function POST() {
  const result = await revalidateFeed()
  return NextResponse.json(result)
}
