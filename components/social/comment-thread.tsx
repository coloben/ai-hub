'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, UserCircle } from 'lucide-react'
import { getLocalProfile, timeAgo } from '@/lib/social/client'
import type { Comment } from '@/lib/social/schema'

interface CommentThreadProps {
  postId: string
  initialCount: number
}

export function CommentThread({ postId, initialCount }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    void fetch(`/api/v1/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.comments)) setComments(d.comments)
      })
      .finally(() => setLoaded(true))
  }, [postId])

  async function submit() {
    if (!content.trim()) return
    const profile = getLocalProfile()
    setBusy(true)
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          author: profile.displayName,
          handle: profile.handle,
        }),
      })
      const data = await res.json()
      if (data.comment) {
        setComments((c) => [...c, data.comment])
        setContent('')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="border-t border-border">
      <h2 className="px-4 py-3 text-sm font-semibold flex items-center gap-2">
        <MessageSquare size={16} className="text-accent" />
        {loaded ? comments.length : initialCount} commentaires
      </h2>

      <div className="px-4 pb-3 flex gap-3">
        <UserCircle size={32} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter un commentaire…"
            rows={2}
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            size="sm"
            className="mt-2 rounded-full"
            disabled={busy || !content.trim()}
            onClick={() => void submit()}
          >
            {busy ? 'Envoi…' : 'Commenter'}
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {comments.map((c) => (
          <div key={c.id} className="px-4 py-3 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-bold text-accent">
              {c.author.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-muted-foreground mb-0.5">
                <span className="font-medium text-foreground">{c.author}</span> @{c.handle} ·{' '}
                {timeAgo(c.createdAt)}
              </p>
              <p className="text-[13px] text-foreground leading-relaxed">{c.content}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">{c.score} pts</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
