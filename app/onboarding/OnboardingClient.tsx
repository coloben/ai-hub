'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { mockModels } from '@/lib/mock-data'

const INTERESTS = [
  { id: 'code',      label: 'Code & Dev',     icon: '⌨️' },
  { id: 'research',  label: 'Recherche',       icon: '🔬' },
  { id: 'industry',  label: 'Industrie',       icon: '🏢' },
  { id: 'pricing',   label: 'Tarifs & Coûts',  icon: '💰' },
  { id: 'reasoning', label: 'Raisonnement',    icon: '🧠' },
  { id: 'vision',    label: 'Vision & Audio',  icon: '👁️' },
]

const TOP_MODELS = mockModels
  .filter(m => m.scores.arena_elo && m.scores.arena_elo > 1220)
  .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
  .slice(0, 12)

export default function OnboardingClient() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [interests, setInterests] = useState<string[]>([])
  const [followedModels, setFollowedModels] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [suggestedUsername, setSuggestedUsername] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const suggested = (user.user_metadata?.user_name || user.email?.split('@')[0] || '')
        .toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
      setUsername(suggested)
      setSuggestedUsername(suggested)
    })
  }, [])

  async function checkUsername(val: string) {
    if (val.length < 3) { setUsernameError('3 caractères minimum'); return }
    if (!/^[a-z0-9_]+$/.test(val)) { setUsernameError('Lettres minuscules, chiffres et _ uniquement'); return }
    setCheckingUsername(true)
    const { data } = await supabase.from('profiles').select('username').eq('username', val).maybeSingle()
    setCheckingUsername(false)
    if (data) { setUsernameError('Nom d\'utilisateur déjà pris'); return }
    setUsernameError('')
  }

  async function finish() {
    if (!userId) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: userId,
      username,
      interests,
      followed_models: followedModels,
      karma: 0,
      level: 'observateur',
      created_at: new Date().toISOString(),
    })
    router.push('/')
  }

  const toggleInterest = (id: string) =>
    setInterests(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])

  const toggleModel = (id: string) =>
    setFollowedModels(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4 pb-8">
      <div className="w-full max-w-lg animate-slide-up">

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-widest text-text-3">
              Étape {step} / 3
            </span>
            <span className="text-2xs text-text-3">
              {step === 1 ? 'Profil' : step === 2 ? 'Intérêts' : 'Modèles'}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1 — Username */}
        {step === 1 && (
          <div>
            <h2 className="mb-2 text-2xl font-bold text-text">Choisissez votre pseudo</h2>
            <p className="mb-6 text-sm text-text-2">Visible par la communauté. Changeable plus tard.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3">@</span>
              <input
                type="text"
                value={username}
                onChange={e => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
                  setUsername(v)
                  checkUsername(v)
                }}
                placeholder={suggestedUsername || 'mon_pseudo'}
                className="w-full rounded-xl border border-border bg-surface py-3 pl-8 pr-4 text-sm text-text outline-none transition-all focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            {usernameError && <p className="mt-2 text-xs text-error">{usernameError}</p>}
            {!usernameError && username.length >= 3 && !checkingUsername && (
              <p className="mt-2 text-xs text-success">✓ Disponible</p>
            )}
            {checkingUsername && <p className="mt-2 text-xs text-text-3">Vérification…</p>}
            <button
              onClick={() => setStep(2)}
              disabled={!!usernameError || username.length < 3 || checkingUsername}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2 — Interests */}
        {step === 2 && (
          <div>
            <h2 className="mb-2 text-2xl font-bold text-text">Vos centres d'intérêt</h2>
            <p className="mb-6 text-sm text-text-2">Choisissez au moins 2 pour personnaliser votre feed.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INTERESTS.map(interest => {
                const active = interests.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      active
                        ? 'border-primary/60 bg-primary/10 text-text'
                        : 'border-border bg-surface text-text-2 hover:border-border-2'
                    }`}
                  >
                    <span className="text-lg">{interest.icon}</span>
                    {interest.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="rounded-xl border border-border px-4 py-3 text-sm text-text-2 hover:bg-surface-2">
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={interests.length < 2}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Followed models */}
        {step === 3 && (
          <div>
            <h2 className="mb-2 text-2xl font-bold text-text">Suivez vos modèles</h2>
            <p className="mb-6 text-sm text-text-2">Recevez des alertes quand ils bougent dans le classement.</p>
            <div className="grid grid-cols-2 gap-2">
              {TOP_MODELS.map(model => {
                const active = followedModels.includes(model.id)
                return (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
                      active
                        ? 'border-primary/60 bg-primary/10'
                        : 'border-border bg-surface hover:border-border-2'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-text">{model.name}</p>
                      <p className="text-2xs text-text-3">{model.provider}</p>
                    </div>
                    <span className={`text-xs font-mono font-bold tabular-nums ${active ? 'text-primary' : 'text-text-3'}`}>
                      {model.scores.arena_elo}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(2)} className="rounded-xl border border-border px-4 py-3 text-sm text-text-2 hover:bg-surface-2">
                ← Retour
              </button>
              <button
                onClick={finish}
                disabled={saving}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                {saving ? 'Création…' : 'Accéder à AI Hub →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
