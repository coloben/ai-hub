'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VoteButton } from '@/components/VoteButton'

interface Comment {
  id: string
  content: string
  score: number
  created_at: string
  parent_id: string | null
  author: { username: string; karma: number; level: string } | null
}

interface Props {
  postId: string      // ID du post communauté (uuid) OU hash de l'item RSS
  postTitle: string
  open: boolean
  onClose: () => void
}

function timeAgo(date: string): string {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (m < 2) return 'à l\'instant'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

const LEVEL_COLOR: Record<string, string> = {
  observateur:  'text-text-3',
  contributeur: 'text-primary',
  analyste:     'text-success',
  expert:       'text-warn',
  architecte:   'text-[#fbbf24]',
}

export function CommentDrawer({ postId, postTitle, open, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<{ id: string; username?: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('username').eq('id', user.id).single()
          .then(({ data }) => setUser({ id: user.id, username: data?.username }))
      }
    })
  }, [])

  // Charger commentaires
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/comments?post_id=${postId}`)
      .then(r => r.json())
      .then(d => { setComments(d.comments ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, postId])

  // Realtime subscription
  useEffect(() => {
    if (!open) return
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      }, payload => {
        const c = payload.new as Comment
        setComments(prev => prev.some(x => x.id === c.id) ? prev : [c, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [open, postId])

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function submit() {
    if (!content.trim() || sending) return
    if (!user) { router.push('/login'); return }
    setSending(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, parent_id: replyTo?.id ?? null, content }),
    })
    if (res.ok) {
      setContent('')
      setReplyTo(null)
    }
    setSending(false)
  }

  // Threads : top-level + replies
  const topLevel = comments.filter(c => !c.parent_id)
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed bottom-7 right-0 top-12 z-50 flex w-full max-w-md flex-col border-l border-border bg-bg shadow-2xl animate-slide-up"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
          <button onClick={onClose} className="text-text-3 hover:text-text transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text truncate">{postTitle}</p>
            <p className="text-2xs text-text-3">{comments.length} commentaire{comments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 border-b border-border px-5 py-3">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 text-xs text-text-3">
              <span>↩ Répondre à <strong className="text-text-2">@{replyTo.username}</strong></span>
              <button onClick={() => setReplyTo(null)} className="ml-auto text-text-3 hover:text-text">✕</button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xs font-bold text-primary">
              {user?.username?.slice(0, 2).toUpperCase() ?? '?'}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
                placeholder={user ? 'Votre commentaire… (⌘+Entrée pour envoyer)' : 'Connectez-vous pour commenter'}
                disabled={!user}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-3 outline-none focus:border-primary/40 disabled:opacity-50"
              />
              <div className="flex items-center justify-between">
                <span className={`text-2xs ${content.length > 1800 ? 'text-error' : 'text-text-3'}`}>
                  {content.length}/2000
                </span>
                {user ? (
                  <button
                    onClick={submit}
                    disabled={!content.trim() || sending || content.length > 2000}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-40"
                  >
                    {sending ? '…' : 'Envoyer'}
                  </button>
                ) : (
                  <a href="/login" className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10">
                    Se connecter
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-surface-3 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-surface-3" />
                    <div className="h-3 w-full rounded bg-surface-3" />
                    <div className="h-3 w-3/4 rounded bg-surface-3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && topLevel.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm font-semibold text-text">Première réaction</p>
              <p className="text-xs text-text-3 mt-1">Soyez le premier à commenter</p>
            </div>
          )}

          {!loading && topLevel.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies(comment.id)}
              onReply={c => {
                setReplyTo({ id: c.id, username: c.author?.username ?? 'user' })
                textareaRef.current?.focus()
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function CommentItem({
  comment, replies, onReply,
}: {
  comment: Comment
  replies: Comment[]
  onReply: (c: Comment) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const levelColor = LEVEL_COLOR[comment.author?.level ?? 'observateur'] ?? 'text-text-3'

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-2xs font-bold text-text-2">
          {comment.author?.username?.slice(0, 2).toUpperCase() ?? '??'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${levelColor}`}>
              @{comment.author?.username ?? 'anonyme'}
            </span>
            <span className="text-2xs text-text-3">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-text-2 leading-relaxed">{comment.content}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <VoteButton
              targetId={comment.id}
              targetType="comment"
              initialScore={comment.score}
              size="sm"
            />
            <button
              onClick={() => onReply(comment)}
              className="text-2xs text-text-3 hover:text-text-2 transition-colors"
            >
              Répondre
            </button>
            {replies.length > 0 && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="text-2xs text-text-3 hover:text-text-2 transition-colors"
              >
                {expanded ? `▼ ${replies.length} réponse${replies.length > 1 ? 's' : ''}` : `▶ ${replies.length} réponse${replies.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {expanded && replies.length > 0 && (
        <div className="ml-11 mt-2 border-l-2 border-border pl-4 flex flex-col gap-3">
          {replies.map(r => (
            <div key={r.id} className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-2xs font-bold text-text-3">
                {r.author?.username?.slice(0, 2).toUpperCase() ?? '??'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-2xs font-semibold ${LEVEL_COLOR[r.author?.level ?? 'observateur']}`}>
                    @{r.author?.username ?? 'anonyme'}
                  </span>
                  <span className="text-2xs text-text-3">{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-xs text-text-2 leading-relaxed">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
