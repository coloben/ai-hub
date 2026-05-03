'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const error = searchParams.get('error')

  const [loading, setLoading] = useState<'google' | 'github' | null>(null)
  const supabase = createClient()

  async function signIn(provider: 'google' | 'github') {
    setLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    })
    if (error) setLoading(null)
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4 pb-8">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Rejoindre AI Hub</h1>
          <p className="mt-2 text-sm text-text-2">Votez, commentez, contribuez à la veille IA collective.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            Connexion échouée. Réessayez.
          </div>
        )}

        {/* OAuth buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => signIn('google')}
            disabled={!!loading}
            className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-all hover:border-primary/30 hover:bg-surface-2 disabled:opacity-50"
          >
            {loading === 'google' ? (
              <Spinner />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuer avec Google
          </button>

          <button
            onClick={() => signIn('github')}
            disabled={!!loading}
            className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-all hover:border-primary/30 hover:bg-surface-2 disabled:opacity-50"
          >
            {loading === 'github' ? (
              <Spinner />
            ) : (
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            Continuer avec GitHub
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">En rejoignant</p>
          <ul className="flex flex-col gap-2">
            {[
              '↑ Voter sur les actualités IA',
              '💬 Commenter et débattre',
              '🔔 Alertes sur vos modèles favoris',
              '★ Bookmarks et feed personnalisé',
              '🏆 Karma et badges de contribution',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-text-2">{f}</li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-2xs text-text-3">
          En continuant, vous acceptez nos{' '}
          <a href="/terms" className="text-primary hover:underline">CGU</a>
          {' '}et notre{' '}
          <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.
        </p>

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-text-2" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
