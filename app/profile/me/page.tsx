import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MyProfileRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/profile/me')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile?.username) redirect(`/profile/${profile.username}`)
  redirect('/onboarding')
}
