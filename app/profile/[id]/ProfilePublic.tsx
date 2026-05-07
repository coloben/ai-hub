'use client'

import { timeAgo } from '@/lib/utils'

interface ProfilePublicProps {
  profile: any
  comments: any[]
  votes: any[]
}

export default function ProfilePublic({ profile, comments, votes }: ProfilePublicProps) {
  const displayName = profile?.display_name || profile?.username || 'Utilisateur'

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            {profile?.username && <p className="text-sm text-primary mt-0.5">@{profile.username}</p>}
            {profile?.bio && <p className="text-sm text-text-2 mt-2 leading-relaxed">{profile.bio}</p>}

            <div className="flex gap-4 mt-4 text-sm">
              <span className="text-text-3"><b className="text-white">{comments.length}</b> commentaires</span>
              <span className="text-text-3"><b className="text-white">{votes.length}</b> votes</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-4">Activité</h2>

      {comments.length === 0 && votes.length === 0 && (
        <p className="text-sm text-text-3">Aucune activité pour le moment.</p>
      )}

      <div className="space-y-3">
        {comments.map((c: any) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-xs text-text-3 mb-1">
              <span className="text-primary font-medium">Commentaire</span>
              <span>·</span>
              <span>{timeAgo(c.created_at)}</span>
            </div>
            <p className="text-sm text-text-2">{c.content}</p>
          </div>
        ))}

        {votes.map((v: any) => (
          <div key={v.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-xs text-text-3 mb-1">
              <span className={v.value > 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                {v.value > 0 ? 'Upvote' : 'Downvote'}
              </span>
              <span>·</span>
              <span>{timeAgo(v.created_at)}</span>
            </div>
            <p className="text-sm text-text-2">News : {v.target_id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
