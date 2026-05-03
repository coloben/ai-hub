import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, karma, level, interests, followed_models, avatar_url, created_at, last_seen_at')
    .eq('id', user.id)
    .single()

  // Mettre à jour last_seen_at
  await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id)

  return NextResponse.json({ profile, user_id: user.id })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const updates = await request.json()
  const allowed = ['username', 'interests', 'followed_models', 'avatar_url']
  const safe = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )

  if (safe.username) {
    if (typeof safe.username !== 'string' || safe.username.length < 3) {
      return NextResponse.json({ error: 'Username invalide' }, { status: 400 })
    }
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('username', safe.username).neq('id', user.id).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Username déjà pris' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(safe)
    .eq('id', user.id)
    .select('username, karma, level, interests, followed_models')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
