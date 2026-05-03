'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ReviewResult {
  id: string
  rating_quality: number | null
  rating_speed: number | null
  rating_value: number | null
  review_text: string | null
  use_case: string | null
  created_at: string
  author: { username: string; karma: number; level: string } | null
}

interface Props {
  modelId: string
  onSuccess: (review: ReviewResult) => void
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`h-5 w-5 ${i <= (hover || value) ? 'text-[#fbbf24]' : 'text-border'}`}
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export function ReviewForm({ modelId, onSuccess }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [quality, setQuality] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [value, setValue] = useState(0)
  const [text, setText] = useState('')
  const [useCase, setUseCase] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    if (!quality && !speed && !value) { setError('Notez au moins un critère'); return }

    setSubmitting(true)
    const { data, error: err } = await supabase
      .from('model_reviews')
      .upsert({
        user_id: user.id,
        model_id: modelId,
        rating_quality: quality || null,
        rating_speed: speed || null,
        rating_value: value || null,
        review_text: text.trim() || null,
        use_case: useCase.trim() || null,
      }, { onConflict: 'user_id,model_id' })
      .select('*, author:profiles(username, karma, level)')
      .single()

    if (err) { setError(err.message); setSubmitting(false); return }
    onSuccess(data as ReviewResult)
  }

  return (
    <form onSubmit={submit} className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Qualité', val: quality, set: setQuality },
          { label: 'Vitesse', val: speed, set: setSpeed },
          { label: 'Valeur/Prix', val: value, set: setValue },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <p className="mb-1.5 text-2xs font-semibold text-text-3 uppercase tracking-wide">{label}</p>
            <StarPicker value={val} onChange={set} />
          </div>
        ))}
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={useCase}
          onChange={e => setUseCase(e.target.value)}
          placeholder="Cas d'usage (ex: génération de code, rédaction...)"
          maxLength={100}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary/40 placeholder:text-text-3"
        />
      </div>

      <div className="mb-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Partagez votre expérience avec ce modèle…"
          maxLength={1000}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary/40 placeholder:text-text-3"
        />
      </div>

      {error && <p className="mb-3 text-xs text-error">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
      >
        {submitting ? 'Publication…' : 'Publier mon avis'}
      </button>
    </form>
  )
}
