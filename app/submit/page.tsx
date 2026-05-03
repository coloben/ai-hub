'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 'release',   label: 'Release',     icon: '🚀' },
  { id: 'benchmark', label: 'Benchmark',   icon: '📊' },
  { id: 'research',  label: 'Recherche',   icon: '🔬' },
  { id: 'industry',  label: 'Industrie',   icon: '🏢' },
  { id: 'pricing',   label: 'Tarifs',      icon: '💰' },
  { id: 'community', label: 'Communauté',  icon: '💬' },
]

export default function SubmitPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('release')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirect=/submit'); return }

    if (!title.trim()) { setError('Le titre est requis'); return }

    setSubmitting(true)
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, summary, category, tags }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erreur'); setSubmitting(false); return }

    setSuccess(true)
    setTimeout(() => router.push('/news'), 1500)
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="text-xl font-bold text-text">Soumission publiée !</h2>
          <p className="mt-2 text-sm text-text-2">+10 karma · Redirection vers le feed…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Soumettre une actualité</h1>
        <p className="mt-2 text-sm text-text-2">Partagez une news IA avec la communauté. +10 karma à la publication.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Titre */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-2">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ex: GPT-5 annoncé par OpenAI avec contexte 2M tokens"
            maxLength={300}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-3"
          />
          <p className="mt-1 text-right text-2xs text-text-3">{title.length}/300</p>
        </div>

        {/* URL */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-2">URL source</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://openai.com/..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-3"
          />
        </div>

        {/* Résumé */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-2">Résumé <span className="text-text-3">(optionnel)</span></label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Décrivez en 2-3 phrases l'essentiel de l'info…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-3"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-text-2">Catégorie</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'border-primary/60 bg-primary/10 text-text'
                    : 'border-border bg-surface text-text-2 hover:border-border-2'
                }`}
              >
                <span>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-2">Tags <span className="text-text-3">(séparés par des virgules)</span></label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="gpt-5, openai, reasoning"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-3"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-40"
        >
          {submitting ? 'Publication…' : 'Publier la soumission'}
        </button>

      </form>
    </div>
  )
}
