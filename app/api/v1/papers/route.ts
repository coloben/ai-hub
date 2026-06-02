import { NextRequest, NextResponse } from 'next/server'
import { getFeed } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50)

  try {
    const feed = await getFeed()
    const data = feed.posts.slice(0, limit).map(p => ({
      id: p.id,
      title: p.title,
      author: p.author,
      publishedAt: new Date().toISOString(),
      url: p.sourceUrl ?? '',
      tags: p.tags,
      upvotes: p.votes,
      source: p.handle,
    }))

    return NextResponse.json(
      { data, meta: { total: feed.posts.length, limit, updatedAt: feed.updatedAt, sources: feed.sources } },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to load papers' }, { status: 500 })
  }
}
