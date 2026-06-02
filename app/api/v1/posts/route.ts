import { NextRequest, NextResponse } from 'next/server'
import { CreatePostSchema, FeedSortSchema } from '@/lib/social/schema'
import { createCommunityPost, getUnifiedFeed } from '@/lib/social'
import { clientKey, rateLimit } from '@/lib/security/rate-limit'
import type { HubId } from '@/lib/social/hubs'
import { HUB_IDS } from '@/lib/social/hubs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const sort = FeedSortSchema.safeParse(searchParams.get('sort') ?? 'hot')
  const hubParam = searchParams.get('hub') ?? 'all'
  const hub =
    hubParam === 'all' || !HUB_IDS.includes(hubParam as HubId)
      ? ('all' as const)
      : (hubParam as HubId)

  const data = await getUnifiedFeed({
    sort: sort.success ? sort.data : 'hot',
    hub,
  })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, 'post'), 10, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: `Limite atteinte — ${rl.retryAfterSec}s` },
      { status: 429 }
    )
  }
  try {
    const body = await req.json()
    const parsed = CreatePostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const post = await createCommunityPost(parsed.data)
    return NextResponse.json({ post }, { status: 201 })
  } catch (e) {
    console.error('[API posts POST]', e)
    return NextResponse.json({ error: 'Impossible de publier' }, { status: 500 })
  }
}
