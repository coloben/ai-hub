'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { mockModels } from '@/lib/mock-data'

const INTERESTS = [
  { id: 'code',      label: 'Code',          icon: '⌨️' },
  { id: 'research',  label: 'Recherche',     icon: '🔬' },
  { id: 'reasoning', label: 'Raisonnement',  icon: '🧠' },
  { id: 'vision',    label: 'Vision',        icon: '👁️' },
  { id: 'industry',  label: 'Industrie',     icon: '🏢' },
  { id: 'pricing',   label: 'Tarifs',        icon: '💰' },
  { id: 'audio',     label: 'Audio',         icon: '🎤' },
  { id: 'agent',     label: 'Agents',        icon: '🤖' },
]

const LEVEL_CONFIG: Record<string, { label: string; min: number; color: string }> = {
  observateur:  { label: 'Observateur',  min: 0,    color: 'text-text-3' },
  contributeur: { label: 'Contributeur', min: 50,   color: 'text-primary' },
  analyste:     { label: 'Analyste',     min: 200,  color: 'text-success' },
  expert:       { label: 'Expert',       min: 500,  color: 'text-warn' },
  architecte:   { label: 'Architecte',  min: 1000, color: 'text-[#fbbf24]' },
}

interface Profile {
  username: string
  karma: number
  level: string
  interests: string[]
  followed_models: string[]
  avatar_url: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  // Form fields
  const [username, setUsername] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [followedModels, setFollowedModels] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/me')
      .then(r => {
        if (r.status === 401) { setLoggedIn(false); setLoading(false); return null }
        setLoggedIn(true)
        return r.json()
      })
      .then(d => {
        if (d?.profile) {
          setProfile(d.profile)
          setUsername(d.profile.username ?? '')
          setInterests(d.profile.interests ?? [])
          setFollowedModels(d.profile.followed_models ?? [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)

    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, interests, followed_models: followedModels }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }

    setProfile(prev => prev ? { ...prev, ...data.profile } : data.profile)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function deleteAccount() {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loggedIn === false) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">⚙️</p>
          <h2 className="text-xl font-bold text-text mb-2">Paramètres</h2>
          <p className="text-sm text-text-2 mb-6">Connectez-vous pour accéder à vos paramètres.</p>
          <Link href="/login?redirect=/settings"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-surface-2" />
          <div className="h-32 rounded-xl bg-surface-2" />
          <div className="h-48 rounded-xl bg-surface-2" />
        </div>
      </div>
    )
  }

  // Niveau et progression
  const levels = Object.entries(LEVEL_CONFIG).sort((a, b) => a[1].min - b[1].min)
  const currentLevelIdx = levels.findIndex(([k]) => k === profile?.level) ?? 0
  const nextLevel = levels[currentLevelIdx + 1]
  const karmaProgress = nextLevel
    ? Math.min(100, Math.round(((profile?.karma ?? 0) - levels[currentLevelIdx][1].min) / (nextLevel[1].min - levels[currentLevelIdx][1].min) * 100))
    : 100

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-16 md:px-6">
      <h1 className="mb-8 text-2xl font-bold text-text">Paramètres du compte</h1>

      <form onSubmit={save} className="space-y-6">

        {/* Karma card */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Profil & Karma</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
              {username.slice(0, 2).toUpperCase() || '??'}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${LEVEL_CONFIG[profile?.level ?? 'observateur']?.color}`}>
                {LEVEL_CONFIG[profile?.level ?? 'observateur']?.label}
              </p>
              <p className="text-xs text-text-3">{profile?.karma ?? 0} karma</p>
              {nextLevel && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${karmaProgress}%` }}
                    />
                  </div>
                  <span className="text-2xs text-text-3 shrink-0">{nextLevel[1].min - (profile?.karma ?? 0)} pts pour {LEVEL_CONFIG[nextLevel[0]]?.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-2">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_-]+"
              placeholder="mon_pseudo"
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
            <p className="mt-1 text-2xs text-text-3">3-24 caractères, lettres, chiffres, _ et -</p>
          </div>
        </div>

        {/* Intérêts */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold text-text">Intérêts</h2>
          <p className="mb-4 text-xs text-text-3">Personnalise votre feed et vos alertes</p>
          <div className="grid grid-cols-4 gap-2">
            {INTERESTS.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => setInterests(prev =>
                  prev.includes(interest.id) ? prev.filter(i => i !== interest.id) : [...prev, interest.id]
                )}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                  interests.includes(interest.id)
                    ? 'border-primary/50 bg-primary/10 text-text'
                    : 'border-border bg-surface-2 text-text-3 hover:border-border-2'
                }`}
              >
                <span className="text-xl">{interest.icon}</span>
                <span>{interest.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modèles suivis */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold text-text">Modèles suivis</h2>
          <p className="mb-4 text-xs text-text-3">Recevez des alertes quand ces modèles bougent</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mockModels
              .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
              .slice(0, 18)
              .map(model => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setFollowedModels(prev =>
                    prev.includes(model.id) ? prev.filter(m => m !== model.id) : [...prev, model.id]
                  )}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                    followedModels.includes(model.id)
                      ? 'border-primary/40 bg-primary/10 text-text'
                      : 'border-border bg-surface-2 text-text-3 hover:border-border-2'
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${followedModels.includes(model.id) ? 'bg-primary' : 'bg-border'}`} />
                  <span className="truncate">{model.name}</span>
                </button>
              ))}
          </div>
          {followedModels.length > 0 && (
            <p className="mt-3 text-xs text-primary">{followedModels.length} modèle{followedModels.length > 1 ? 's' : ''} suivi{followedModels.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Erreur + save */}
        {error && <p className="text-xs text-error">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
            saved
              ? 'bg-success/20 text-success border border-success/30'
              : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-40'
          }`}
        >
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé !' : 'Sauvegarder les paramètres'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="mt-8 rounded-2xl border border-error/20 bg-error/5 p-5">
        <h2 className="mb-1 text-sm font-semibold text-error">Zone de danger</h2>
        <p className="mb-4 text-xs text-text-3">Ces actions sont irréversibles.</p>
        <button
          onClick={deleteAccount}
          className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-xs font-semibold text-error hover:bg-error/20 transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
