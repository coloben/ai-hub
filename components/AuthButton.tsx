'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthButton() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ username: string; karma: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('username, karma').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('username, karma').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.refresh()
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
      >
        Connexion
      </Link>
    )
  }

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? 'AI'

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs transition-all hover:border-border-2"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-2xs font-bold text-primary">
          {initials}
        </span>
        <span className="hidden text-text-2 sm:block">{profile?.username ?? '…'}</span>
        {profile !== null && (
          <span className="hidden text-2xs text-text-3 sm:block">{profile.karma} pts</span>
        )}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/30">
            <Link href="/profile/me" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text">
              Mon profil
            </Link>
            <Link href="/bookmarks" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text">
              Sauvegardes
            </Link>
            <Link href="/notifications" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text">
              Notifications
            </Link>
            <Link href="/settings" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text">
              Paramètres
            </Link>
            <div className="border-t border-border" />
            <button onClick={signOut}
              className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-error/10">
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  )
}
