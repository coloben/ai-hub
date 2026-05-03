'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { mockModels } from '@/lib/mock-data'
import Image from 'next/image'

const INTERESTS = [
  { id: 'code',      label: 'Code & Dev',    icon: '⌨️' },
  { id: 'research',  label: 'Recherche',     icon: '🔬' },
  { id: 'industry',  label: 'Industrie',     icon: '🏢' },
  { id: 'pricing',   label: 'Tarifs',        icon: '💰' },
  { id: 'reasoning', label: 'Raisonnement',  icon: '🧠' },
  { id: 'vision',    label: 'Vision',        icon: '👁️' },
  { id: 'agent',     label: 'Agents',        icon: '🤖' },
  { id: 'audio',     label: 'Audio',         icon: '🎤' },
]

const TOP_MODELS = mockModels
  .filter(m => m.scores.arena_elo && m.scores.arena_elo > 1220)
  .sort((a, b) => (b.scores.arena_elo ?? 0) - (a.scores.arena_elo ?? 0))
  .slice(0, 12)

const STEPS = ['Avatar', 'Pseudo', 'Intérêts', 'Modèles']

// Couleurs d'avatar générés auto
const AVATAR_COLORS = [
  ['#2563eb', '#1e40af'], ['#7c3aed', '#5b21b6'], ['#059669', '#047857'],
  ['#dc2626', '#b91c1c'], ['#d97706', '#b45309'], ['#0891b2', '#0e7490'],
]

export default function OnboardingClient() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [oauthAvatarUrl, setOauthAvatarUrl] = useState<string | null>(null)

  // Step 0 — Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [avatarMode, setAvatarMode] = useState<'oauth' | 'upload' | 'generated'>('oauth')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null)

  // Step 1 — Username
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [suggestedUsername, setSuggestedUsername] = useState('')

  // Step 2 — Interests
  const [interests, setInterests] = useState<string[]>([])

  // Step 3 — Models
  const [followedModels, setFollowedModels] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const suggested = (user.user_metadata?.user_name || user.email?.split('@')[0] || '')
        .toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
      setUsername(suggested)
      setSuggestedUsername(suggested)
      const oauthAvatar = user.user_metadata?.avatar_url ?? null
      setOauthAvatarUrl(oauthAvatar)
      if (oauthAvatar) setAvatarMode('oauth')
      else setAvatarMode('generated')
    })
  }, [])

  // ── Avatar handlers ──
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Max 5 MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarMode('upload')
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!userId || !avatarFile) return null
    setUploadingAvatar(true)
    const ext = avatarFile.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
    if (error) { setUploadingAvatar(false); return null }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setUploadedAvatarUrl(data.publicUrl)
    setUploadingAvatar(false)
    return data.publicUrl
  }

  // ── Username ──
  async function checkUsername(val: string) {
    if (val.length < 3) { setUsernameError('3 caractères minimum'); return }
    if (!/^[a-z0-9_]+$/.test(val)) { setUsernameError('Lettres, chiffres et _ uniquement'); return }
    setCheckingUsername(true)
    const { data } = await supabase.from('profiles').select('username').eq('username', val).maybeSingle()
    setCheckingUsername(false)
    setUsernameError(data ? 'Déjà pris' : '')
  }

  // ── Finish ──
  async function finish() {
    if (!userId) return
    setSaving(true)

    let finalAvatar: string | null = null
    if (avatarMode === 'upload' && avatarFile) finalAvatar = await uploadAvatar()
    else if (avatarMode === 'oauth') finalAvatar = oauthAvatarUrl

    await supabase.from('profiles').upsert({
      id: userId, username, interests,
      followed_models: followedModels,
      karma: 0, level: 'observateur',
      avatar_url: finalAvatar,
      created_at: new Date().toISOString(),
    })
    router.push('/')
  }

  // ── Current avatar preview ──
  const [c1, c2] = AVATAR_COLORS[selectedColor]
  const currentAvatar = avatarMode === 'upload' && avatarPreview
    ? <Image src={avatarPreview} alt="avatar" fill className="object-cover" />
    : avatarMode === 'oauth' && oauthAvatarUrl
    ? <Image src={oauthAvatarUrl} alt="avatar" fill className="object-cover" />
    : null

  return (
    <div className="flex min-h-[calc(100vh-48px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg animate-slide-up">

        {/* Progress stepper */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    i < step ? 'bg-success text-white' :
                    i === step ? 'bg-primary text-white ring-4 ring-primary/20' :
                    'bg-surface-2 border border-border text-text-3'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`mt-1.5 text-2xs font-medium ${i === step ? 'text-text' : 'text-text-3'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-1 mb-5 h-px flex-1 transition-all ${i < step ? 'bg-success' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 0 — Avatar ── */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h2 className="mb-1.5 text-2xl font-bold text-text">Votre photo de profil</h2>
            <p className="mb-8 text-sm text-text-2">
              {oauthAvatarUrl ? 'On a récupéré votre photo OAuth — vous pouvez la garder ou en choisir une autre.' : 'Choisissez une photo ou un avatar généré.'}
            </p>

            {/* Avatar large preview */}
            <div className="mb-8 flex flex-col items-center gap-6">
              <div className="relative">
                <div
                  className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-border"
                  style={!currentAvatar ? { background: `linear-gradient(135deg, ${c1}, ${c2})` } : {}}
                >
                  {currentAvatar}
                  {!currentAvatar && (
                    <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white">
                      {(username || suggestedUsername || '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFileChange} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {oauthAvatarUrl && (
                <button
                  onClick={() => setAvatarMode('oauth')}
                  className={`rounded-xl border p-3 text-center text-xs font-medium transition-all ${avatarMode === 'oauth' ? 'border-primary/50 bg-primary/10 text-text' : 'border-border bg-surface text-text-3 hover:border-border-2'}`}
                >
                  <p className="text-xl mb-1">🔗</p>
                  Photo OAuth
                </button>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className={`rounded-xl border p-3 text-center text-xs font-medium transition-all ${avatarMode === 'upload' ? 'border-primary/50 bg-primary/10 text-text' : 'border-border bg-surface text-text-3 hover:border-border-2'}`}
              >
                <p className="text-xl mb-1">📸</p>
                Importer
              </button>
              <button
                onClick={() => setAvatarMode('generated')}
                className={`rounded-xl border p-3 text-center text-xs font-medium transition-all ${avatarMode === 'generated' ? 'border-primary/50 bg-primary/10 text-text' : 'border-border bg-surface text-text-3 hover:border-border-2'}`}
              >
                <p className="text-xl mb-1">🎨</p>
                Généré
              </button>
            </div>

            {/* Color picker si generated */}
            {avatarMode === 'generated' && (
              <div className="mb-6">
                <p className="mb-3 text-xs text-text-3">Choisissez une couleur</p>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map(([c1, c2], i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(i)}
                      className={`h-9 w-9 rounded-full transition-all ${selectedColor === i ? 'ring-2 ring-white ring-offset-2 ring-offset-bg scale-110' : 'opacity-70 hover:opacity-100'}`}
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
            >
              Continuer →
            </button>
            <button onClick={() => setStep(1)} className="mt-3 w-full text-xs text-text-3 hover:text-text-2 transition-colors">
              Passer cette étape
            </button>
          </div>
        )}

        {/* ── STEP 1 — Username ── */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="mb-1.5 text-2xl font-bold text-text">Votre pseudo</h2>
            <p className="mb-6 text-sm text-text-2">Visible par la communauté. Modifiable dans les paramètres.</p>

            {/* Mini avatar */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
              <div
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full"
                style={avatarMode === 'generated' ? { background: `linear-gradient(135deg, ${c1}, ${c2})` } : {}}
              >
                {avatarMode === 'upload' && avatarPreview && <Image src={avatarPreview} alt="" fill className="object-cover" />}
                {avatarMode === 'oauth' && oauthAvatarUrl && <Image src={oauthAvatarUrl} alt="" fill className="object-cover" />}
                {avatarMode === 'generated' && (
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {(username || '?').slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text">@{username || '…'}</p>
                <p className="text-xs text-text-3">Observateur · 0 karma</p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-3">@</span>
              <input
                type="text"
                value={username}
                onChange={e => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
                  setUsername(v)
                  checkUsername(v)
                }}
                placeholder={suggestedUsername || 'mon_pseudo'}
                className="w-full rounded-2xl border border-border bg-surface py-3.5 pl-9 pr-4 text-sm text-text outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checkingUsername && <span className="text-xs text-text-3">…</span>}
                {!checkingUsername && !usernameError && username.length >= 3 && (
                  <span className="text-success">✓</span>
                )}
              </div>
            </div>
            {usernameError && <p className="mt-2 text-xs text-error">{usernameError}</p>}
            <p className="mt-2 text-2xs text-text-3">{username.length}/20 · lettres minuscules, chiffres et _</p>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(0)} className="rounded-2xl border border-border px-5 py-3.5 text-sm text-text-2 hover:bg-surface-2 transition-colors">
                ←
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!!usernameError || username.length < 3 || checkingUsername}
                className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Interests ── */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="mb-1.5 text-2xl font-bold text-text">Vos centres d'intérêt</h2>
            <p className="mb-6 text-sm text-text-2">Au moins 2 — pour personnaliser votre feed et vos alertes.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INTERESTS.map(interest => {
                const active = interests.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => setInterests(p => p.includes(interest.id) ? p.filter(i => i !== interest.id) : [...p, interest.id])}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-all ${
                      active
                        ? 'border-primary/60 bg-primary/10 text-text shadow-[0_0_0_1px_rgba(37,99,235,0.3)]'
                        : 'border-border bg-surface text-text-2 hover:border-border-2 hover:bg-surface-2'
                    }`}
                  >
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="text-xs font-medium leading-tight">{interest.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-text-3">{interests.length} sélectionné{interests.length > 1 ? 's' : ''} {interests.length < 2 && '(minimum 2)'}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="rounded-2xl border border-border px-5 py-3.5 text-sm text-text-2 hover:bg-surface-2 transition-colors">←</button>
              <button
                onClick={() => setStep(3)}
                disabled={interests.length < 2}
                className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Models ── */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="mb-1.5 text-2xl font-bold text-text">Suivez vos modèles</h2>
            <p className="mb-6 text-sm text-text-2">Alertes dès qu'ils bougent dans le classement Arena.</p>
            <div className="grid grid-cols-2 gap-2">
              {TOP_MODELS.map(model => {
                const active = followedModels.includes(model.id)
                return (
                  <button
                    key={model.id}
                    onClick={() => setFollowedModels(p => p.includes(model.id) ? p.filter(i => i !== model.id) : [...p, model.id])}
                    className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left transition-all ${
                      active
                        ? 'border-primary/50 bg-primary/10 shadow-[0_0_0_1px_rgba(37,99,235,0.2)]'
                        : 'border-border bg-surface hover:border-border-2'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-text">{model.name}</p>
                      <p className="text-2xs text-text-3">{model.provider}</p>
                    </div>
                    <span className={`ml-2 shrink-0 text-xs font-mono font-bold tabular-nums ${active ? 'text-primary' : 'text-text-3'}`}>
                      {model.scores.arena_elo}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-text-3">{followedModels.length} modèle{followedModels.length > 1 ? 's' : ''} suivi{followedModels.length > 1 ? 's' : ''}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(2)} className="rounded-2xl border border-border px-5 py-3.5 text-sm text-text-2 hover:bg-surface-2 transition-colors">←</button>
              <button
                onClick={finish}
                disabled={saving || uploadingAvatar}
                className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {saving ? 'Création du profil…' : 'Accéder à AI Hub 🚀'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
