'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FEATURES = [
  { icon: '↑', label: 'Voter sur les actualités IA', sub: 'Upvote / downvote sur chaque signal' },
  { icon: '💬', label: 'Commenter & débattre',       sub: 'Threads threadés en temps réel' },
  { icon: '🔔', label: 'Alertes personnalisées',     sub: 'ELO, prix, nouvelles releases' },
  { icon: '✨', label: 'Feed sur-mesure',             sub: 'Filtré selon vos intérêts' },
  { icon: '🏆', label: 'Karma & niveaux',            sub: 'De Observateur à Architecte' },
]

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
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
    })
    if (error) setLoading(null)
  }

  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col lg:flex-row">

      {/* ── LEFT PANEL — features ─────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden border-r border-border bg-gradient-to-br from-[#0d0d12] via-[#0f1020] to-[#0d0d12] px-14 py-16">
        {/* Background glow */}
        <div className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-48 w-48 rounded-full bg-[#8b5cf6]/8 blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-sm font-bold text-primary">AI</div>
          <span className="text-sm font-bold text-text">AI Hub</span>
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-success live-pulse" />
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-text">
            La veille IA<br />
            <span className="bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
              collective
            </span>
          </h2>
          <p className="mb-10 max-w-sm text-base text-text-2 leading-relaxed">
            Suivez l'évolution des modèles en temps réel, votez, commentez et construisez votre réputation.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-lg">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{f.label}</p>
                  <p className="text-xs text-text-3">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 border-t border-border pt-8">
          {[
            { value: '24+', label: 'Modèles suivis' },
            { value: 'Live', label: 'Scores Arena' },
            { value: '100%', label: 'Open community' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-bold text-text">{s.value}</p>
              <p className="text-2xs text-text-3">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — auth form ───────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px] animate-slide-up">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-xs font-bold text-primary">AI</div>
            <span className="text-sm font-bold text-text">AI Hub</span>
          </div>

          <h1 className="mb-1 text-2xl font-bold tracking-tight text-text">Créer un compte</h1>
          <p className="mb-8 text-sm text-text-2">Déjà membre ? Connectez-vous ci-dessous.</p>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 px-4 py-3">
              <span className="text-error">⚠</span>
              <p className="text-sm text-error">Connexion échouée. Réessayez.</p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={() => signIn('google')}
            disabled={!!loading}
            className="group mb-3 flex w-full items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-3.5 text-sm font-medium text-text shadow-sm transition-all hover:border-[#4285F4]/40 hover:bg-surface-2 hover:shadow-[0_0_0_1px_rgba(66,133,244,0.15)] disabled:opacity-50"
          >
            {loading === 'google' ? <Spinner /> : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="flex-1 text-left">Continuer avec Google</span>
            <svg className="h-4 w-4 text-text-3 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          {/* GitHub */}
          <button
            onClick={() => signIn('github')}
            disabled={!!loading}
            className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-3.5 text-sm font-medium text-text shadow-sm transition-all hover:border-[#fff]/20 hover:bg-surface-2 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] disabled:opacity-50"
          >
            {loading === 'github' ? <Spinner /> : (
              <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            <span className="flex-1 text-left">Continuer avec GitHub</span>
            <svg className="h-4 w-4 text-text-3 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-2xs text-text-3">Sécurisé via OAuth 2.0</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: '�', label: 'Aucun mot de passe' },
              { icon: '🚫', label: 'Sans pub' },
              { icon: '🇪�', label: 'RGPD compliant' },
            ].map(t => (
              <div key={t.label} className="rounded-xl border border-border bg-surface px-2 py-3">
                <p className="text-lg">{t.icon}</p>
                <p className="mt-1 text-2xs text-text-3 leading-tight">{t.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-2xs text-text-3">
            En continuant, vous acceptez nos{' '}
            <a href="/terms" className="text-primary hover:underline">CGU</a>{' '}
            et notre{' '}
            <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-text-3" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
