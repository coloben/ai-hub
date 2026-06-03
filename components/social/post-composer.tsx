'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserCircle, Send } from 'lucide-react'
import { getLocalProfile, getVoterId } from '@/lib/social/client'
import { HUBS, FLAIRS } from '@/lib/social/hubs'
import type { HubId } from '@/lib/social/hubs'
import type { Flair } from '@/lib/social/hubs'

interface PostComposerProps {
  defaultHub?: HubId
  onPosted?: () => void
}

export function PostComposer({ defaultHub = 'general', onPosted }: PostComposerProps) {
  const profile = getLocalProfile()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [hub, setHub] = useState<HubId>(defaultHub)
  const [flair, setFlair] = useState<Flair>('Discussion')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!title.trim() || !content.trim()) return
    setBusy(true)
    setError(null)
    try {
      const tags = content.match(/#(\w+)/g)?.map((t) => t.slice(1)) ?? []
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hub,
          flair,
          title: title.trim(),
          content: content.trim(),
          tags: tags.slice(0, 5),
          author: profile.displayName,
          handle: profile.handle.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32) || 'user',
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? 'Erreur publication')
      }
      setTitle('')
      setContent('')
      onPosted?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publication impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div id="post-composer" className="px-4 py-3 border-b border-border bg-card/50 scroll-mt-20">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/20 border border-border flex items-center justify-center shrink-0">
          <UserCircle size={20} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <select
              value={hub}
              onChange={(e) => setHub(e.target.value as HubId)}
              className="text-[11px] bg-muted border border-border rounded-md px-2 py-1 text-foreground"
              aria-label="Hub"
            >
              {HUBS.map((h) => (
                <option key={h.id} value={h.id}>
                  h/{h.id}
                </option>
              ))}
            </select>
            <select
              value={flair}
              onChange={(e) => setFlair(e.target.value as Flair)}
              className="text-[11px] bg-muted border border-border rounded-md px-2 py-1 text-foreground"
              aria-label="Flair"
            >
              {FLAIRS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du post"
            maxLength={300}
            className="w-full bg-transparent border-none text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partagez une news, un benchmark, une question… #tags"
            rows={3}
            maxLength={4000}
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              @{profile.handle} · id {getVoterId().slice(-8)}
            </p>
            <Button
              size="sm"
              disabled={busy || !title.trim() || !content.trim()}
              onClick={() => void submit()}
              className="rounded-full px-4 gap-1.5"
            >
              <Send size={14} />
              {busy ? 'Envoi…' : 'Publier'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
