import { NextRequest, NextResponse } from 'next/server'
import { VotePostSchema } from '@/lib/social/schema'
import { voteOnPost, getPostById } from '@/lib/social'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const parsed = VotePostSchema.safeParse({ ...body, postId: id })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await getPostById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })
    }

    if (existing.kind === 'curated') {
      return NextResponse.json(
        { ok: false, error: 'Les actualités importées (arXiv/HF) ne sont pas votables.' },
        { status: 403 }
      )
    }

    const result = await voteOnPost(
      id,
      parsed.data.voterId,
      parsed.data.direction,
      existing.kind
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error('[API vote]', e)
    return NextResponse.json({ error: 'Vote échoué' }, { status: 500 })
  }
}
