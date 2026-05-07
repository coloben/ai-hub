import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfilePublic from './ProfilePublic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: votes } = await supabase
    .from('votes')
    .select('id, target_id, value, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return (
    <ProfilePublic
      profile={profile}
      comments={comments ?? []}
      votes={votes ?? []}
    />
  )
}
