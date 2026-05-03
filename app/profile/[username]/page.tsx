import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { mockModels } from '@/lib/mock-data'

const LEVEL_BADGE: Record<string, { label: string; color: string }> = {
  observateur:  { label: 'Observateur',  color: 'text-text-3 bg-surface-3' },
  contributeur: { label: 'Contributeur', color: 'text-primary bg-primary/10' },
  analyste:     { label: 'Analyste',     color: 'text-success bg-success/10' },
  expert:       { label: 'Expert',       color: 'text-warn bg-warn/10' },
  architecte:   { label: 'Architecte',   color: 'text-[#fbbf24] bg-[#fbbf24]/10' },
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  return {
    title: `@${params.username} — AI Hub`,
    description: `Profil communauté de ${params.username} sur AI Hub.`,
  }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, score, created_at, category')
    .eq('author_id', profile.id)
    .eq('is_removed', false)
    .order('score', { ascending: false })
    .limit(10)

  const followedModels = mockModels.filter(m => (profile.followed_models ?? []).includes(m.id))
  const badge = LEVEL_BADGE[profile.level] ?? LEVEL_BADGE['observateur']
  const joined = new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-16">

      {/* Header profil */}
      <div className="mb-8 flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-2xl font-bold text-primary">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-text">@{profile.username}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-2xs font-semibold ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-3">Membre depuis {joined}</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums text-text">{profile.karma}</p>
              <p className="text-2xs text-text-3 uppercase tracking-wide">Karma</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums text-text">{posts?.length ?? 0}</p>
              <p className="text-2xs text-text-3 uppercase tracking-wide">Posts</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums text-text">{followedModels.length}</p>
              <p className="text-2xs text-text-3 uppercase tracking-wide">Modèles suivis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modèles suivis */}
      {followedModels.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">Modèles suivis</h2>
          <div className="flex flex-wrap gap-2">
            {followedModels.map(m => (
              <span key={m.id} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-2">
                {m.name}
                <span className="ml-2 font-mono text-text-3">{m.scores.arena_elo}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Contributions */}
      <section>
        <h2 className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">
          Contributions récentes
        </h2>
        {!posts || posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-text-3">Aucune contribution pour l'instant.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3">
                <span className={`shrink-0 text-xs font-bold tabular-nums ${post.score >= 0 ? 'text-success' : 'text-error'}`}>
                  {post.score > 0 ? `+${post.score}` : post.score}
                </span>
                <p className="flex-1 truncate text-sm text-text">{post.title}</p>
                <span className="shrink-0 text-2xs text-text-3">
                  {new Date(post.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
