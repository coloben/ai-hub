import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, post_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: votes } = await supabase
    .from('votes')
    .select('id, target_id, value, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <ProfileClient
      user={user}
      profile={profile}
      comments={comments ?? []}
      votes={votes ?? []}
    />
  )
}
