'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

interface ProfileClientProps {
  user: any
  profile: any
  comments: any[]
  votes: any[]
}

export default function ProfileClient({ user, profile, comments, votes }: ProfileClientProps) {
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState(profile?.username || '')
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('profiles')
      .update({ username, display_name: displayName, bio, avatar_url: avatarUrl })
      .eq('id', user.id)
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Profil mis à jour !')
    setSaving(false)
    setEditMode(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {(displayName || username || user.email?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">
              {displayName || username || user.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-text-3 mt-0.5">{user.email}</p>
            {username && <p className="text-sm text-primary mt-0.5">@{username}</p>}
            {bio && <p className="text-sm text-text-2 mt-2 leading-relaxed">{bio}</p>}

            <div className="flex gap-4 mt-4 text-sm">
              <span className="text-text-3"><b className="text-white">{comments.length}</b> commentaires</span>
              <span className="text-text-3"><b className="text-white">{votes.length}</b> votes</span>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-2 transition-colors"
          >
            Modifier
          </button>
        </div>

        {editMode && (
          <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
            <input
              className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Nom affiché"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <input
              className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="URL photo de profil"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="Bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surface-2 transition-colors"
              >
                Annuler
              </button>
            </div>
            {message && <p className="text-sm text-green-400">{message}</p>}
          </div>
        )}
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
