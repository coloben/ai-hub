import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { target_id, target_type, value } = await request.json()
  if (!target_id || !target_type || ![1, -1].includes(value)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  // Upsert vote (toggle si même valeur = annuler)
  const { data: existing } = await supabase
    .from('votes')
    .select('id, value')
    .eq('user_id', user.id)
    .eq('target_id', target_id)
    .eq('target_type', target_type)
    .maybeSingle()

  if (existing) {
    if (existing.value === value) {
      // Annuler le vote
      await supabase.from('votes').delete().eq('id', existing.id)
      return NextResponse.json({ action: 'removed', value: 0 })
    } else {
      // Changer de vote
      await supabase.from('votes').update({ value }).eq('id', existing.id)
      return NextResponse.json({ action: 'changed', value })
    }
  }

  const { error } = await supabase.from('votes').insert({
    user_id: user.id, target_id, target_type, value,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ action: 'added', value })
}
