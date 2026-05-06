import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Connexion — AI Hub',
  description: 'Rejoignez la communauté AI Hub pour voter, commenter et contribuer.',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  )
}
