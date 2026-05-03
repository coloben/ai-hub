import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const post_id = searchParams.get('post_id')
  if (!post_id) return NextResponse.json({ error: 'post_id requis' }, { status: 400 })

  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles(username, karma, level)')
    .eq('post_id', post_id)
    .eq('is_removed', false)
    .order('score', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { post_id, parent_id, content } = await request.json()
  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Commentaire trop long (2000 max)' }, { status: 400 })
  }

  const { data, error } = await supabase.from('comments').insert({
    post_id, parent_id: parent_id ?? null,
    author_id: user.id,
    content: content.trim(),
  }).select('*, author:profiles(username, karma, level)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Karma +1 pour contribution
  await supabase.rpc('increment_karma', { user_id: user.id, amount: 1 }).maybeSingle()

  return NextResponse.json({ comment: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  // Soft delete — owner only
  const { error } = await supabase
    .from('comments')
    .update({ is_removed: true })
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
