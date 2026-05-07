'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function getAvatarInitials() {
    const source = username || user.email?.split('@')[0] || 'U'
    return source.slice(0, 2).toUpperCase()
  }

  function getDisplayTitle() {
    return displayName || username || user.email?.split('@')[0] || 'Utilisateur'
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setMessage('Erreur : uniquement PNG ou JPEG')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Erreur : image max 5 Mo')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setMessage('')
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarFile || !user?.id) return avatarUrl
    const ext = avatarFile.name.split('.').pop()?.toLowerCase() === 'png' ? 'png' : 'jpg'
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
    if (error) {
      console.error('[Avatar upload]', error)
      return null
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  async function saveProfile() {
    setSaving(true)
    setMessage('')

    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      const uploaded = await uploadAvatar()
      if (uploaded) newAvatarUrl = uploaded
      else {
        setMessage('Erreur : impossible d\'uploader l\'avatar')
        setSaving(false)
        return
      }
    }

    const payload: any = {
      display_name: displayName,
      bio,
      avatar_url: newAvatarUrl,
    }
    if (username && username.trim()) {
      payload.username = username.trim()
    }

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)

    if (error) {
      console.error('[Save profile]', error)
      setMessage('Erreur : ' + error.message)
    } else {
      setAvatarUrl(newAvatarUrl)
      setAvatarFile(null)
      setAvatarPreview(null)
      setMessage('Profil mis à jour !')
      setEditMode(false)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
            ) : (
              <span>{getAvatarInitials()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">
              {getDisplayTitle()}
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
            {editMode ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {editMode && (
          <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
            <div>
              <label className="block text-xs font-medium text-text-3 mb-1">Pseudo (@nom_utilisateur)</label>
              <input
                className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="mon_pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-3 mb-1">Nom affiché</label>
              <input
                className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Mon Nom"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-3 mb-1">Photo de profil (PNG/JPEG, max 5 Mo)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={onAvatarChange}
              />
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="preview" fill className="object-cover" />
                  ) : avatarUrl ? (
                    <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
                  ) : (
                    <span>{getAvatarInitials()}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-surface-2 transition-colors"
                >
                  Changer la photo
                </button>
                {avatarFile && (
                  <span className="text-xs text-text-3">{avatarFile.name}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-3 mb-1">Bio</label>
              <textarea
                className="w-full rounded-lg bg-[#1a1a20] border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Quelques mots sur vous..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false)
                  setAvatarPreview(null)
                  setAvatarFile(null)
                  setMessage('')
                }}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surface-2 transition-colors"
              >
                Annuler
              </button>
            </div>
            {message && (
              <p className={`text-sm ${message.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
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
