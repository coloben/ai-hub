import { NextRequest, NextResponse } from 'next/server'
import { CreateCommentSchema } from '@/lib/social/schema'
import { getComments, addComment } from '@/lib/social'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const comments = await getComments(id)
  return NextResponse.json({ comments })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const parsed = CreateCommentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const comment = await addComment(id, parsed.data)
    if (!comment) {
      return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })
    }
    return NextResponse.json({ comment }, { status: 201 })
  } catch (e) {
    console.error('[API comments]', e)
    return NextResponse.json({ error: 'Commentaire échoué' }, { status: 500 })
  }
}
