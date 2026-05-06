'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
      >
        Se connecter
      </Link>
    )
  }

  const email = user.email ?? 'Utilisateur'
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
        {initial}
      </div>
      <div className="hidden md:block">
        <p className="text-xs font-medium text-text">{email}</p>
      </div>
      <button
        onClick={signOut}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
      >
        Déconnexion
      </button>
    </div>
  )
}
