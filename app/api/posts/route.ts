import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CORS = { 'Access-Control-Allow-Origin': '*' }

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  let query = supabase
    .from('posts')
    .select('*, author:profiles(username, karma, level)')
    .eq('is_removed', false)
    .order('score', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  return NextResponse.json({ posts: data ?? [], total: data?.length ?? 0 }, { headers: CORS })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Vérifier niveau karma minimum (contributeur = 50 pts)
  const { data: profile } = await supabase
    .from('profiles').select('karma, level, is_banned').eq('id', user.id).single()

  if (profile?.is_banned) return NextResponse.json({ error: 'Compte suspendu' }, { status: 403 })
  if ((profile?.karma ?? 0) < 10) {
    return NextResponse.json({ error: 'Karma insuffisant (10 pts minimum)' }, { status: 403 })
  }

  const { title, url, summary, category, tags } = await request.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  if (title.length > 300) return NextResponse.json({ error: 'Titre trop long' }, { status: 400 })

  // Vérifier doublon URL
  if (url) {
    const { data: existing } = await supabase
      .from('posts').select('id').eq('url', url).maybeSingle()
    if (existing) return NextResponse.json({ error: 'URL déjà soumise' }, { status: 409 })
  }

  const { data, error } = await supabase.from('posts').insert({
    author_id: user.id,
    title: title.trim(),
    url: url?.trim() || null,
    summary: summary?.trim() || null,
    category: category || 'community',
    tags: tags ?? [],
  }).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Karma +10 pour première soumission
  await supabase.rpc('increment_karma', { user_id: user.id, amount: 10 }).maybeSingle()

  return NextResponse.json({ post: data }, { status: 201 })
}
