import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPairVoteStats, submitCommunityVote, SubmitVoteSchema } from '@/lib/votes'
import { clientKey, rateLimit } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  category: z.string(),
  modelAId: z.string(),
  modelBId: z.string(),
})

export async function GET(req: NextRequest) {
  const parsed = QuerySchema.safeParse({
    category: req.nextUrl.searchParams.get('category'),
    modelAId: req.nextUrl.searchParams.get('modelAId'),
    modelBId: req.nextUrl.searchParams.get('modelBId'),
  })

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 })
  }

  const { category, modelAId, modelBId } = parsed.data
  if (modelAId === modelBId) {
    return NextResponse.json({ ok: false, error: 'Models must differ' }, { status: 400 })
  }

  try {
    const stats = await getPairVoteStats(category, modelAId, modelBId)
    return NextResponse.json({ ok: true, stats })
  } catch (err) {
    console.error('[API votes GET]', err)
    return NextResponse.json({ ok: false, error: 'Failed to load vote stats' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SubmitVoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid vote payload' }, { status: 400 })
  }

  const { modelAId, modelBId } = parsed.data
  if (modelAId === modelBId) {
    return NextResponse.json({ ok: false, error: 'Models must differ' }, { status: 400 })
  }

  const rl = rateLimit(clientKey(req, 'vote'), 30, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: `Trop de votes — réessayez dans ${rl.retryAfterSec}s` },
      { status: 429 }
    )
  }

  try {
    const result = await submitCommunityVote(parsed.data)
    return NextResponse.json({
      ok: result.ok,
      duplicate: result.duplicate,
      stats: result.stats,
      message: result.duplicate
        ? 'Vous avez déjà voté pour cette paire.'
        : 'Vote enregistré.',
    })
  } catch (err) {
    console.error('[API votes POST]', err)
    return NextResponse.json({ ok: false, error: 'Failed to save vote' }, { status: 500 })
  }
}
